from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class SanteAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sante_app'

    def ready(self):
        # Import here to avoid AppRegistryNotReady exception
        from .scheduler import scheduler
        
        # Start the scheduler
        try:
            scheduler.start()
            logger.info("Medication reminder scheduler started successfully")
        except Exception as e:
            logger.error(f"Failed to start medication reminder scheduler: {e}")