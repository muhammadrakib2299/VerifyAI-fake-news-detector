"""Add explainability_data column to analyses

Revision ID: a2b3c4d5e6f7
Revises: 7f447e815b92
Create Date: 2026-04-01 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, Sequence[str], None] = '7f447e815b92'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add explainability_data JSON column."""
    op.add_column('analyses', sa.Column('explainability_data', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Remove explainability_data column."""
    op.drop_column('analyses', 'explainability_data')
