from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base import Base


class InstancesTable(Base):
    __tablename__ = "instances"

    id = Column("id", String(5), primary_key=True, index=True)
    formula_id = Column("formula_id", Integer, ForeignKey("formulas.id"), nullable=False)
    version = Column("version", String(32), nullable=False)
    visible = Column("visible", Boolean, nullable=False, default=True)
    route_id = Column("route_id", Integer, ForeignKey("routes.id"), nullable=False)

    route = relationship("RoutesTable", back_populates="instances")
    formula = relationship("FormulasTable", back_populates="instances")
