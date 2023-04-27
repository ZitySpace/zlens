from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base import Base


class RoutesTable(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    children = relationship("RoutesTable", back_populates="parent")
    parent = relationship("RoutesTable", remote_side=[id], back_populates="children")
    route = Column(String, nullable=False)

    instances = relationship("InstancesTable", back_populates="route")
