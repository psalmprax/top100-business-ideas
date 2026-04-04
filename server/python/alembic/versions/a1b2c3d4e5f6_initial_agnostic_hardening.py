"""initial agnostic hardening

Revision ID: a1b2c3d4e5f6
Revises: 
Create Date: 2026-04-04 00:06:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use inspector to check for column existence (agnostic way to handle existing manual migrations)
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    columns = [col['name'] for col in inspector.get_columns('alertconfig')]

    if 'limit' not in columns:
        op.add_column('alertconfig', sa.Column('limit', sa.Float(), nullable=True, server_default='100.0'))
    
    if 'action' not in columns:
        op.add_column('alertconfig', sa.Column('action', sa.String(), nullable=True, server_default='pause'))
        
    if 'priority' not in columns:
        op.add_column('alertconfig', sa.Column('priority', sa.String(), nullable=True, server_default='medium'))


def downgrade() -> None:
    # In a real agnosticism scenario, we'd drop them here if we wanted to revert
    # But often we keep them. For completeness:
    op.drop_column('alertconfig', 'priority')
    op.drop_column('alertconfig', 'action')
    op.drop_column('alertconfig', 'limit')
