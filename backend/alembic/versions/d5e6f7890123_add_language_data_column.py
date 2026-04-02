"""Add language_data column to analyses

Revision ID: d5e6f7890123
Revises: c4d5e6f78901
Create Date: 2026-04-02 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5e6f7890123'
down_revision: Union[str, Sequence[str], None] = 'c4d5e6f78901'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add language_data JSON column."""
    op.add_column('analyses', sa.Column('language_data', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Remove language_data column."""
    op.drop_column('analyses', 'language_data')
