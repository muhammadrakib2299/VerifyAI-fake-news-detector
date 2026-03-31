"""
Fine-tune RoBERTa for fake news classification.

Usage:
    python backend/ml/train_roberta.py

Requires: torch, transformers, scikit-learn
Note: GPU recommended. Training on CPU will be very slow.
"""

import pandas as pd
import numpy as np
import torch
from pathlib import Path
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from transformers import (
    RobertaTokenizer,
    RobertaForSequenceClassification,
    TrainingArguments,
    Trainer,
)
from torch.utils.data import Dataset

PROCESSED_DIR = Path(__file__).parent.parent.parent / "data" / "processed"
MODEL_DIR = Path(__file__).parent / "models" / "roberta-fakenews"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MAX_LENGTH = 256


class FakeNewsDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {key: val[idx] for key, val in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return {
        "accuracy": accuracy_score(labels, predictions),
        "precision": precision_score(labels, predictions),
        "recall": recall_score(labels, predictions),
        "f1": f1_score(labels, predictions),
    }


def main():
    print("VerifyAI — RoBERTa Fine-tuning")
    print("=" * 40)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # Load data
    train_df = pd.read_csv(PROCESSED_DIR / "train.csv")
    val_df = pd.read_csv(PROCESSED_DIR / "val.csv")
    test_df = pd.read_csv(PROCESSED_DIR / "test.csv")
    print(f"Train: {len(train_df)} | Val: {len(val_df)} | Test: {len(test_df)}")

    # Tokenize
    tokenizer = RobertaTokenizer.from_pretrained("roberta-base")

    print("Tokenizing...")
    train_enc = tokenizer(train_df["text"].tolist(), padding="max_length",
                          truncation=True, max_length=MAX_LENGTH, return_tensors="pt")
    val_enc = tokenizer(val_df["text"].tolist(), padding="max_length",
                        truncation=True, max_length=MAX_LENGTH, return_tensors="pt")
    test_enc = tokenizer(test_df["text"].tolist(), padding="max_length",
                         truncation=True, max_length=MAX_LENGTH, return_tensors="pt")

    train_dataset = FakeNewsDataset(train_enc, train_df["label_encoded"].values)
    val_dataset = FakeNewsDataset(val_enc, val_df["label_encoded"].values)
    test_dataset = FakeNewsDataset(test_enc, test_df["label_encoded"].values)

    # Model
    model = RobertaForSequenceClassification.from_pretrained("roberta-base", num_labels=2)
    print(f"Model params: {sum(p.numel() for p in model.parameters()) / 1e6:.1f}M")

    # Training
    training_args = TrainingArguments(
        output_dir="./roberta_training",
        num_train_epochs=3,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=32,
        warmup_steps=500,
        weight_decay=0.01,
        learning_rate=2e-5,
        logging_steps=100,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        report_to="none",
        fp16=torch.cuda.is_available(),
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
    )

    print("\nStarting training...")
    trainer.train()

    # Evaluate
    print("\n=== Test Set Results ===")
    test_pred = trainer.predict(test_dataset)
    y_pred = np.argmax(test_pred.predictions, axis=-1)
    y_true = test_df["label_encoded"].values
    print(classification_report(y_true, y_pred, target_names=["Real", "Fake"]))

    # Save
    model.save_pretrained(str(MODEL_DIR))
    tokenizer.save_pretrained(str(MODEL_DIR))
    print(f"\nModel saved to: {MODEL_DIR}")


if __name__ == "__main__":
    main()
