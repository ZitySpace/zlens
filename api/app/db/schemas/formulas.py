from sqlalchemy import Column, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from ..base import Base


class FormulasTable(Base):
    __tablename__ = "formulas"
    __table_args__ = (UniqueConstraint("creator", "slug", name="uq_formulas_creator_slug"),)

    id = Column("id", Integer, primary_key=True, index=True)
    title = Column("title", String(64), nullable=False)
    slug = Column("slug", String(64), nullable=False)
    description = Column("description", String(512), nullable=False)
    version = Column("version", String(32), nullable=False)
    creator = Column("creator", String(32), nullable=False)
    author = Column("author", String(32), nullable=False)
    config = Column("config", Text, nullable=False)
    endpoint = Column("endpoint", String(256), nullable=True)
    installed_at = Column("installed_at", DateTime(timezone=True), nullable=False)
    updated_at = Column("updated_at", DateTime(timezone=True), nullable=False)
    served_at = Column("served_at", DateTime(timezone=True), nullable=True)

    instances = relationship("InstancesTable", back_populates="formula")
