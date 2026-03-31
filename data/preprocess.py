"""
Preprocess and unify datasets for VerifyAI.

Combines LIAR, ISOT (if available), and FakeNewsNet into a single
unified dataset with consistent binary labels (real/fake).

Usage:
    python data/preprocess.py
"""

import re
import pandas as pd
from pathlib import Path

RAW_DIR = Path(__file__).parent / "raw"
PROCESSED_DIR = Path(__file__).parent / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def clean_text(text: str) -> str:
    """Basic text cleaning."""
    if not isinstance(text, str):
        return ""
    # Remove URLs
    text = re.sub(r"http\S+|www\.\S+", "", text)
    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def process_liar() -> pd.DataFrame:
    """Process LIAR dataset: map 6-class labels to binary."""
    print("Processing LIAR dataset...")
    liar_cols = [
        "id", "label", "statement", "subject", "speaker", "job",
        "state", "party", "barely_true_count", "false_count",
        "half_true_count", "mostly_true_count", "pants_fire_count", "context",
    ]

    dfs = []
    for split in ["train.tsv", "valid.tsv", "test.tsv"]:
        path = RAW_DIR / "liar" / split
        if path.exists():
            df = pd.read_csv(path, sep="\t", header=None, names=liar_cols)
            dfs.append(df)

    if not dfs:
        print("  [SKIP] LIAR dataset not found")
        return pd.DataFrame()

    liar = pd.concat(dfs, ignore_index=True)

    # Map to binary labels
    label_map = {
        "true": "real",
        "mostly-true": "real",
        "half-true": "real",
        "barely-true": "fake",
        "false": "fake",
        "pants-fire": "fake",
    }
    liar["binary_label"] = liar["label"].map(label_map)

    # Clean text
    liar["clean_text"] = liar["statement"].apply(clean_text)

    # Remove empty/null
    liar = liar[liar["clean_text"].str.len() > 10].copy()
    liar = liar.dropna(subset=["binary_label"])

    result = liar[["clean_text", "binary_label"]].copy()
    result.columns = ["text", "label"]
    result["source_dataset"] = "liar"

    print(f"  LIAR: {len(result)} samples — {result['label'].value_counts().to_dict()}")
    return result


def process_isot() -> pd.DataFrame:
    """Process ISOT dataset: combine True.csv and Fake.csv."""
    print("Processing ISOT dataset...")

    true_path = RAW_DIR / "isot" / "True.csv"
    fake_path = RAW_DIR / "isot" / "Fake.csv"

    if not true_path.exists() or not fake_path.exists():
        print("  [SKIP] ISOT dataset not found (requires Kaggle download)")
        return pd.DataFrame()

    true_df = pd.read_csv(true_path)
    true_df["label"] = "real"
    fake_df = pd.read_csv(fake_path)
    fake_df["label"] = "fake"

    isot = pd.concat([true_df, fake_df], ignore_index=True)

    # Combine title and text
    isot["full_text"] = isot["title"].fillna("") + ". " + isot["text"].fillna("")
    isot["clean_text"] = isot["full_text"].apply(clean_text)

    # Remove empty/short
    isot = isot[isot["clean_text"].str.len() > 20].copy()

    # Remove duplicates
    isot = isot.drop_duplicates(subset=["clean_text"])

    result = isot[["clean_text", "label"]].copy()
    result.columns = ["text", "label"]
    result["source_dataset"] = "isot"

    print(f"  ISOT: {len(result)} samples — {result['label'].value_counts().to_dict()}")
    return result


def process_fakenewsnet() -> pd.DataFrame:
    """Process FakeNewsNet: use titles as text data."""
    print("Processing FakeNewsNet dataset...")

    fnn_dir = RAW_DIR / "fakenewsnet"
    files = {
        "politifact_real.csv": "real",
        "politifact_fake.csv": "fake",
        "gossipcop_real.csv": "real",
        "gossipcop_fake.csv": "fake",
    }

    dfs = []
    for filename, label in files.items():
        path = fnn_dir / filename
        if path.exists():
            df = pd.read_csv(path)
            df["label"] = label
            dfs.append(df)

    if not dfs:
        print("  [SKIP] FakeNewsNet dataset not found")
        return pd.DataFrame()

    fnn = pd.concat(dfs, ignore_index=True)

    # Use title as text (full articles not available in CSV)
    fnn["clean_text"] = fnn["title"].apply(clean_text)

    # Remove empty/short titles
    fnn = fnn[fnn["clean_text"].str.len() > 10].copy()

    # Remove duplicates
    fnn = fnn.drop_duplicates(subset=["clean_text"])

    result = fnn[["clean_text", "label"]].copy()
    result.columns = ["text", "label"]
    result["source_dataset"] = "fakenewsnet"

    print(f"  FakeNewsNet: {len(result)} samples — {result['label'].value_counts().to_dict()}")
    return result


def main():
    print("VerifyAI — Data Preprocessing")
    print("=" * 40)

    # Process each dataset
    datasets = [process_liar(), process_isot(), process_fakenewsnet()]
    datasets = [df for df in datasets if len(df) > 0]

    if not datasets:
        print("\n[ERROR] No datasets found! Run download_datasets.py first.")
        return

    # Combine all
    unified = pd.concat(datasets, ignore_index=True)

    # Final deduplication
    before = len(unified)
    unified = unified.drop_duplicates(subset=["text"])
    after = len(unified)
    print(f"\nRemoved {before - after} duplicates across datasets")

    # Shuffle
    unified = unified.sample(frac=1, random_state=42).reset_index(drop=True)

    # Save
    output_path = PROCESSED_DIR / "unified_dataset.csv"
    unified.to_csv(output_path, index=False)

    print(f"\n=== Unified Dataset ===")
    print(f"Total samples: {len(unified)}")
    print(f"Label distribution: {unified['label'].value_counts().to_dict()}")
    print(f"Source distribution: {unified['source_dataset'].value_counts().to_dict()}")
    print(f"\nSaved to: {output_path}")


if __name__ == "__main__":
    main()
