"""
Localization Service for Agent Ops
Multi-language support for enterprise deployments.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class LocalizationService:
    """
    Multi-language localization service for Agent Ops dashboard and alerts.
    Supports English, German, French, Spanish, and more.
    """
    
    def __init__(self):
        self.current_locale = "en"
        self.supported_locales = ["en", "de", "fr", "es", "it", "pt", "nl", "ja", "zh"]
        
        # Initialize translation dictionaries
        self.translations = self._init_translations()
    
    def _init_translations(self) -> Dict[str, Dict[str, str]]:
        """Initialize translation dictionaries."""
        
        return {
            "en": {
                # Navigation
                "nav.dashboard": "Dashboard",
                "nav.agents": "Agents",
                "nav.budgets": "Budgets",
                "nav.audit": "Audit Trail",
                "nav.settings": "Settings",
                
                # Agent status
                "agent.status.running": "Running",
                "agent.status.stopped": "Stopped",
                "agent.status.error": "Error",
                "agent.status.paused": "Paused",
                
                # Budget
                "budget.daily": "Daily Budget",
                "budget.monthly": "Monthly Budget",
                "budget.spent": "Spent",
                "budget.remaining": "Remaining",
                
                # Alerts
                "alert.budget_warning": "Budget Warning",
                "alert.budget_exceeded": "Budget Exceeded",
                "alert.agent_error": "Agent Error",
                "alert.loop_detected": "Loop Detected",
                
                # Actions
                "action.pause": "Pause",
                "action.resume": "Resume",
                "action.terminate": "Terminate",
                "action.create": "Create Agent",
                "action.edit": "Edit",
                "action.delete": "Delete",
                "action.save": "Save Changes",
                "action.cancel": "Cancel",
                
                # Metrics
                "metrics.total_requests": "Total Requests",
                "metrics.loops_prevented": "Loops Prevented",
                "metrics.cost_saved": "Cost Saved",
                "metrics.uptime": "Uptime",
                
                # Compliance
                "compliance.audit_trail": "Audit Trail",
                "compliance.compliance": "Compliance",
                
                # Common
                "common.loading": "Loading...",
                "common.error": "Error",
                "common.success": "Success",
                "common.confirm": "Confirm",
                "common.search": "Search",
                "common.filter": "Filter",
                "common.export": "Export",
                "common.last_updated": "Last Updated",
            },
            "de": {
                "nav.dashboard": "Dashboard",
                "nav.agents": "Agenten",
                "nav.budgets": "Budgets",
                "nav.audit": "Prüfprotokoll",
                "nav.settings": "Einstellungen",
                
                "agent.status.running": "Läuft",
                "agent.status.stopped": "Gestoppt",
                "agent.status.error": "Fehler",
                "agent.status.paused": "Pausiert",
                
                "budget.daily": "Tagesbudget",
                "budget.monthly": "Monatsbudget",
                "budget.spent": "Ausgegeben",
                "budget.remaining": "Verbleibend",
                
                "alert.budget_warning": "Budgetwarnung",
                "alert.budget_exceeded": "Budget überschritten",
                "alert.agent_error": "Agentenfehler",
                "alert.loop_detected": "Schleife erkannt",
                
                "action.pause": "Pausieren",
                "action.resume": "Fortsetzen",
                "action.terminate": "Beenden",
                "action.create": "Agent erstellen",
                "action.edit": "Bearbeiten",
                "action.delete": "Löschen",
                "action.save": "Änderungen speichern",
                "action.cancel": "Abbrechen",
                
                "metrics.total_requests": "Gesamtanfragen",
                "metrics.loops_prevented": "Verhinderte Schleifen",
                "metrics.cost_saved": "Gesparte Kosten",
                "metrics.uptime": "Verfügbarkeit",
                
                "common.loading": "Laden...",
                "common.error": "Fehler",
                "common.success": "Erfolg",
                "common.confirm": "Bestätigen",
                "common.search": "Suchen",
                "common.filter": "Filtern",
                "common.export": "Exportieren",
                "common.last_updated": "Zuletzt aktualisiert",
            },
            "fr": {
                "nav.dashboard": "Tableau de bord",
                "nav.agents": "Agents",
                "nav.budgets": "Budgets",
                "nav.audit": "Piste d'audit",
                "nav.settings": "Paramètres",
                
                "agent.status.running": "En cours",
                "agent.status.stopped": "Arrêté",
                "agent.status.error": "Erreur",
                "agent.status.paused": "En pause",
                
                "budget.daily": "Budget quotidien",
                "budget.monthly": "Budget mensuel",
                "budget.spent": "Dépensé",
                "budget.remaining": "Restant",
                
                "action.pause": "Pause",
                "action.resume": "Reprendre",
                "action.terminate": "Terminer",
                "action.create": "Créer un agent",
                "action.edit": "Modifier",
                "action.delete": "Supprimer",
                "action.save": "Enregistrer",
                "action.cancel": "Annuler",
                
                "metrics.total_requests": "Requêtes totales",
                "metrics.loops_prevented": "Boucles évitées",
                "metrics.cost_saved": "Coût économisé",
                "metrics.uptime": "Disponibilité",
                
                "common.loading": "Chargement...",
                "common.error": "Erreur",
                "common.success": "Succès",
                "common.confirm": "Confirmer",
                "common.search": "Rechercher",
                "common.filter": "Filtrer",
                "common.export": "Exporter",
            },
            "es": {
                "nav.dashboard": "Panel de control",
                "nav.agents": "Agentes",
                "nav.budgets": "Presupuestos",
                "nav.audit": "Registro de auditoría",
                "nav.settings": "Configuración",
                
                "agent.status.running": "Ejecutando",
                "agent.status.stopped": "Detenido",
                "agent.status.error": "Error",
                "agent.status.paused": "Pausado",
                
                "budget.daily": "Presupuesto diario",
                "budget.monthly": "Presupuesto mensual",
                "budget.spent": "Gastado",
                "budget.remaining": "Restante",
                
                "action.pause": "Pausar",
                "action.resume": "Reanudar",
                "action.terminate": "Terminar",
                "action.create": "Crear agente",
                "action.edit": "Editar",
                "action.delete": "Eliminar",
                "action.save": "Guardar",
                "action.cancel": "Cancelar",
                
                "metrics.total_requests": "Solicitudes totales",
                "metrics.loops_prevented": "Bucles evitados",
                "metrics.cost_saved": "Coste ahorrado",
                "metrics.uptime": "Tiempo de actividad",
                
                "common.loading": "Cargando...",
                "common.error": "Error",
                "common.success": "Éxito",
                "common.confirm": "Confirmar",
                "common.search": "Buscar",
                "common.filter": "Filtrar",
                "common.export": "Exportar",
            },
        }
    
    def set_locale(self, locale: str) -> bool:
        """Set the current locale."""
        
        if locale not in self.supported_locales:
            logger.warning(f"Locale {locale} not supported, falling back to English")
            locale = "en"
        
        self.current_locale = locale
        logger.info(f"Locale set to: {locale}")
        
        return True
    
    def get_locale(self) -> str:
        """Get the current locale."""
        
        return self.current_locale
    
    def t(self, key: str, locale: Optional[str] = None) -> str:
        """
        Translate a key to the current locale.
        
        Example:
            localization.t("nav.dashboard") -> "Dashboard" (or "Tableau de bord" in French)
        """
        
        target_locale = locale or self.current_locale
        
        # Get translations for target locale
        translations = self.translations.get(target_locale, self.translations["en"])
        
        # Return translation or key if not found
        return translations.get(key, key)
    
    def get_supported_locales(self) -> List[Dict[str, Any]]:
        """Get list of supported locales with metadata."""
        
        locale_metadata = {
            "en": {"name": "English", "native_name": "English", "flag": "🇺🇸"},
            "de": {"name": "German", "native_name": "Deutsch", "flag": "🇩🇪"},
            "fr": {"name": "French", "native_name": "Français", "flag": "🇫🇷"},
            "es": {"name": "Spanish", "native_name": "Español", "flag": "🇪🇸"},
            "it": {"name": "Italian", "native_name": "Italiano", "flag": "🇮🇹"},
            "pt": {"name": "Portuguese", "native_name": "Português", "flag": "🇵🇹"},
            "nl": {"name": "Dutch", "native_name": "Nederlands", "flag": "🇳🇱"},
            "ja": {"name": "Japanese", "native_name": "日本語", "flag": "🇯🇵"},
            "zh": {"name": "Chinese", "native_name": "中文", "flag": "🇨🇳"},
        }
        
        return [
            {
                "code": code,
                **metadata,
                "supported": True,
            }
            for code, metadata in locale_metadata.items()
        ]
    
    def translate_object(
        self,
        obj: Dict[str, Any],
        keys: List[str],
        locale: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Translate specific keys in an object."""
        
        result = obj.copy()
        
        for key in keys:
            if key in result and isinstance(result[key], str):
                result[key] = self.t(result[key], locale)
        
        return result
    
    def get_all_translations(self, locale: Optional[str] = None) -> Dict[str, str]:
        """Get all translations for a locale."""
        
        target_locale = locale or self.current_locale
        return self.translations.get(target_locale, self.translations["en"])
    
    def format_currency(
        self,
        amount: float,
        currency: str = "USD",
        locale: Optional[str] = None,
    ) -> str:
        """Format currency based on locale."""
        
        target_locale = locale or self.current_locale
        
        currency_symbols = {
            "USD": "$",
            "EUR": "€",
            "GBP": "£",
            "JPY": "¥",
        }
        
        symbol = currency_symbols.get(currency, "$")
        
        # Format based on locale
        if target_locale == "ja":
            return f"¥{amount:,.0f}"
        elif target_locale in ["de", "fr", "es", "it"]:
            return f"{symbol}{amount:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        else:
            return f"{symbol}{amount:,.2f}"
    
    def format_date(
        self,
        date: datetime,
        locale: Optional[str] = None,
    ) -> str:
        """Format date based on locale."""
        
        target_locale = locale or self.current_locale
        
        formats = {
            "en": "%B %d, %Y",
            "de": "%d. %B %Y",
            "fr": "%d %B %Y",
            "es": "%d de %B de %Y",
        }
        
        format_str = formats.get(target_locale, formats["en"])
        
        return date.strftime(format_str)


# Singleton instance
localization_service = LocalizationService()
