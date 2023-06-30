"""add endpoint to formulas table

Revision ID: 02cf552a1854
Revises: d4dfbfae2e9d
Create Date: 2023-05-15 07:36:09.419377

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "02cf552a1854"
down_revision = "d4dfbfae2e9d"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("formulas", sa.Column("endpoint", sa.String(length=256), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("formulas", "endpoint")
    # ### end Alembic commands ###