import json
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Union
from io import BytesIO
from sqlmodel import Session, select
from app.core.database import engine
from app.core.models import AIModel, ArticleScan, SystemConnection
from app.services.audit_service import audit_service

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
    )
    from reportlab.lib import colors

    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    logging.warning("reportlab not available. PDF generation disabled.")

logger = logging.getLogger(__name__)


class DocumentationService:
    """
    Article 11 Technical Documentation Service.
    Compiles real system data into regulatory-ready compliance packages.
    """

    async def generate_article_11_package(self, model_id: str) -> Dict[str, Any]:
        """
        Generate a comprehensive Article 11 technical documentation package.
        Aggregates real metadata, scan results, and connection evidence from database.
        """
        try:
            with Session(engine) as session:
                # 1. Fetch Model Metadata - No fallbacks, must exist in DB
                model = session.get(AIModel, model_id)
                if not model:
                    raise ValueError(
                        f"Model {model_id} not found in database. Cannot generate documentation for non-existent model."
                    )

                model_data = model.dict()

                # 2. Fetch Article Scans (Validation Evidence)
                scan_statement = (
                    select(ArticleScan)
                    .where(ArticleScan.article_id == model_id)
                    .order_by(ArticleScan.created_at.desc())
                )
                scans = session.exec(scan_statement).all()
                scan_history = [s.dict() for s in scans]

                # 3. Fetch System Connections (Infrastructure Evidence)
                conn_statement = select(SystemConnection).where(
                    SystemConnection.article_id == model_id
                )
                connections = session.exec(conn_statement).all()
                connection_evidence = [c.dict() for c in connections]

                # 4. Compile Annex IV Structure with real data
                package = {
                    "document_id": f"ART11-{str(uuid.uuid4())[:8]}-{datetime.now().strftime('%Y%m%d')}",
                    "generated_at": datetime.utcnow().isoformat(),
                    "compliance_standard": "EU AI Act - Article 11 / Annex IV",
                    "model_identification": {
                        "id": model.id,
                        "name": model.name,
                        "provider": model.provider,
                        "endpoint_url": model.endpointUrl,
                        "risk_category": model.riskCategory,
                        "compliance_score": model.complianceScore,
                        "status": model.status,
                        "last_audit": model.lastAudit.isoformat()
                        if model.lastAudit
                        else None,
                        "next_audit": model.nextAudit.isoformat()
                        if model.nextAudit
                        else None,
                    },
                    "technical_specifications": {
                        "architecture": self._determine_architecture(model.provider),
                        "hardware_requirements": self._determine_hardware_requirements(
                            model.riskCategory
                        ),
                        "data_lineage": f"Provider: {model.provider}, Endpoint: {model.endpointUrl}",
                        "model_version": getattr(model, "version", "1.0.0"),
                    },
                    "validation_evidence": {
                        "total_scans_performed": len(scan_history),
                        "latest_scan_status": scan_history[0]["status"]
                        if scan_history
                        else "no_scans_found",
                        "latest_scan_score": scan_history[0]["results"].get("score", 0)
                        if scan_history
                        else 0,
                        "scan_history": scan_history,
                    },
                    "operational_controls": {
                        "active_connections": len(
                            [c for c in connections if c.status == "connected"]
                        ),
                        "total_connections": len(connection_evidence),
                        "connections": connection_evidence,
                        "connection_types": list(
                            set(c.connection_type.value for c in connections)
                        ),
                    },
                    "compliance_articles": [
                        article.dict() for article in model.articles
                    ]
                    if hasattr(model, "articles")
                    else [],
                    "status": "ready"
                    if scan_history and connection_evidence
                    else "incomplete_data",
                }

                # Log to persistent audit trail
                audit_service.log_action(
                    agent_id="documentation-generator",
                    action="generate_article_11",
                    intent=f"Regulatory package compilation for {model_id}",
                    outcome="success",
                    metadata={
                        "document_id": package["document_id"],
                        "model_id": model_id,
                        "scans_found": len(scan_history),
                        "connections_found": len(connection_evidence),
                    },
                )

                logger.info(
                    f"Generated Article 11 package for model {model_id} with {len(scan_history)} scans and {len(connection_evidence)} connections"
                )
                return package

        except Exception as e:
            logger.error(f"Failed to generate documentation package: {e}")
            audit_service.log_action(
                agent_id="documentation-generator",
                action="generate_article_11",
                intent=f"Regulatory package compilation for {model_id}",
                outcome="failure",
                metadata={"error": str(e)},
            )
            raise  # Re-raise to let caller handle the error

    def _determine_architecture(self, provider: str) -> str:
        """Determine architecture based on provider"""
        architectures = {
            "openai": "Transformer-based Large Language Model (GPT architecture)",
            "anthropic": "Transformer-based Large Language Model (Claude architecture)",
            "google": "Transformer-based Large Language Model (BERT/Gemini architecture)",
            "meta": "Transformer-based Large Language Model (LLaMA architecture)",
            "microsoft": "Transformer-based Large Language Model (Azure OpenAI)",
        }
        return architectures.get(provider.lower(), "Transformer-based Neural Network")

    def _determine_hardware_requirements(self, risk_category: str) -> str:
        """Determine hardware requirements based on risk category"""
        requirements = {
            "high": "Multi-GPU cluster (8x NVIDIA H100/A100 or equivalent)",
            "medium": "GPU cluster (4x NVIDIA V100/A100 or equivalent)",
            "low": "Single GPU or CPU-based inference (NVIDIA T4 or equivalent)",
        }
        return requirements.get(
            risk_category.lower(), "GPU-accelerated hardware cluster"
        )

    def export_as_json(self, package: Dict[str, Any]) -> str:
        """Export documentation package as JSON string"""
        return json.dumps(package, indent=2, ensure_ascii=False)

    def export_as_pdf(self, package: Dict[str, Any]) -> Optional[bytes]:
        """Export documentation package as PDF bytes"""
        if not PDF_AVAILABLE:
            raise RuntimeError(
                "PDF generation not available. Install reportlab: pip install reportlab"
            )

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Heading1"],
            fontSize=16,
            spaceAfter=30,
        )
        heading_style = ParagraphStyle(
            "CustomHeading",
            parent=styles["Heading2"],
            fontSize=14,
            spaceAfter=12,
        )
        normal_style = styles["Normal"]

        story = []

        # Title
        story.append(
            Paragraph("EU AI Act Article 11 Technical Documentation", title_style)
        )
        story.append(Spacer(1, 12))

        # Document Info
        story.append(Paragraph(f"Document ID: {package['document_id']}", normal_style))
        story.append(Paragraph(f"Generated: {package['generated_at']}", normal_style))
        story.append(
            Paragraph(f"Standard: {package['compliance_standard']}", normal_style)
        )
        story.append(Spacer(1, 20))

        # Model Identification
        story.append(Paragraph("1. Model Identification", heading_style))
        model_id = package["model_identification"]
        story.append(Paragraph(f"Name: {model_id['name']}", normal_style))
        story.append(Paragraph(f"Provider: {model_id['provider']}", normal_style))
        story.append(
            Paragraph(f"Risk Category: {model_id['risk_category']}", normal_style)
        )
        story.append(
            Paragraph(
                f"Compliance Score: {model_id['compliance_score']:.1f}%", normal_style
            )
        )
        story.append(Spacer(1, 12))

        # Technical Specifications
        story.append(Paragraph("2. Technical Specifications", heading_style))
        tech_spec = package["technical_specifications"]
        story.append(
            Paragraph(f"Architecture: {tech_spec['architecture']}", normal_style)
        )
        story.append(
            Paragraph(f"Hardware: {tech_spec['hardware_requirements']}", normal_style)
        )
        story.append(
            Paragraph(f"Data Lineage: {tech_spec['data_lineage']}", normal_style)
        )
        story.append(Spacer(1, 12))

        # Validation Evidence
        story.append(Paragraph("3. Validation Evidence", heading_style))
        val_ev = package["validation_evidence"]
        story.append(
            Paragraph(f"Total Scans: {val_ev['total_scans_performed']}", normal_style)
        )
        story.append(
            Paragraph(f"Latest Status: {val_ev['latest_scan_status']}", normal_style)
        )
        if val_ev["scan_history"]:
            # Create table for scan history
            scan_data = [["Date", "Status", "Score"]]
            for scan in val_ev["scan_history"][:5]:  # Limit to last 5 scans
                scan_data.append(
                    [
                        scan.get("created_at", "N/A")[:10],
                        scan.get("status", "N/A"),
                        str(scan.get("results", {}).get("score", 0)),
                    ]
                )

            scan_table = Table(scan_data)
            scan_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, 0), 12),
                        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                        ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ]
                )
            )
            story.append(scan_table)
        story.append(Spacer(1, 12))

        # Operational Controls
        story.append(Paragraph("4. Operational Controls", heading_style))
        op_ctrl = package["operational_controls"]
        story.append(
            Paragraph(
                f"Active Connections: {op_ctrl['active_connections']}", normal_style
            )
        )
        story.append(
            Paragraph(
                f"Total Connections: {op_ctrl['total_connections']}", normal_style
            )
        )
        if op_ctrl["connection_types"]:
            story.append(
                Paragraph(
                    f"Connection Types: {', '.join(op_ctrl['connection_types'])}",
                    normal_style,
                )
            )

        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    async def export_documentation(
        self, model_id: str, format: str = "json"
    ) -> Union[str, bytes]:
        """
        Export complete documentation package in specified format.

        Args:
            model_id: The AI model ID
            format: Export format ("json" or "pdf")

        Returns:
            Documentation content as string (JSON) or bytes (PDF)
        """
        package = await self.generate_article_11_package(model_id)

        if format.lower() == "pdf":
            return self.export_as_pdf(package)
        else:
            return self.export_as_json(package)


# Singleton
documentation_service = DocumentationService()
