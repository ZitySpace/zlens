from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from ..base import Base


class FormulasTable(Base):
    __tablename__ = "formulas"

    id = Column("id", Integer, primary_key=True, index=True)
    title = Column("title", String(64), nullable=False)
    slug = Column("slug", String(64), nullable=False)
    description = Column("description", String(512), nullable=False)
    version = Column("version", String(32), nullable=False)
    creator = Column("creator", String(32), nullable=False)
    author = Column("author", String(32), nullable=False)
    config = Column("config", Text, nullable=False)
    installed_at = Column("installed_at", DateTime(timezone=True), nullable=False)
    updated_at = Column("updated_at", DateTime(timezone=True), nullable=False)

    instances = relationship("InstancesTable", back_populates="formula")
