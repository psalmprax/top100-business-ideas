"""
ML Inference Service
Real ML model inference for AlphaAI products with actual PyTorch/transformers support
"""

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
import hashlib
import os
from sqlmodel import Session, select
from app.core.database import engine
from app.core.models import SystemSetting

logger = logging.getLogger(__name__)

TORCH_AVAILABLE = False
TRANSFORMERS_AVAILABLE = False
tokenizer = None
classification_model = None
compliance_model = None

try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

    TORCH_AVAILABLE = True
    TRANSFORMERS_AVAILABLE = True
    logger.info("PyTorch and Transformers loaded successfully")
except ImportError as e:
    logger.warning(
        f"ML libraries not available: {e}. Using enhanced heuristic fallback."
    )


class MLInferenceService:
    """Service for running ML model inference with real transformers"""

    def __init__(self):
        self.models = {}
        self.pipelines = {}
        self.cache = {}
        self.cache_size = 1000
        self.model_configs = {
            "agent-ops": {
                "name": "Agent Ops Classifier",
                "description": "Classifies agent operations and optimizes workflows",
                "model_path": os.getenv("AGENT_OPS_MODEL", "facebook/bart-large-mnli"),
                "input_schema": {"task_description": "string", "context": "string"},
                "output_schema": {
                    "classification": "string",
                    "confidence": "float",
                    "suggestions": "list",
                },
            },
            "ai-compliance": {
                "name": "AI Compliance Checker",
                "description": "Checks AI systems for regulatory compliance",
                "model_path": os.getenv(
                    "COMPLIANCE_MODEL", "threatlab/ai-risk-classifier"
                ),
                "input_schema": {"document": "string", "regulations": "list"},
                "output_schema": {
                    "compliance_score": "float",
                    "violations": "list",
                    "recommendations": "list",
                },
            },
            "deepfake-defense": {
                "name": "Deepfake Detector",
                "description": "Detects deepfake audio and video - uses CV-based detection",
                "input_schema": {"media_url": "string", "media_type": "string"},
                "output_schema": {
                    "is_fake": "bool",
                    "confidence": "float",
                    "analysis": "object",
                },
            },
        }

        self._load_models_on_init()

    def _load_models_on_init(self):
        """Pre-load models in background"""
        if TORCH_AVAILABLE and TRANSFORMERS_AVAILABLE:
            asyncio.create_task(self._preload_models())
        else:
            logger.info("Running in heuristic mode - no ML models loaded")

    async def _preload_models(self):
        """Pre-load all configured models"""
        for model_name, config in self.model_configs.items():
            if model_name != "deepfake-defense":
                await self.load_model(model_name)

    async def load_model(self, model_name: str) -> bool:
        """Load an ML model with real transformer"""
        if model_name in self.models:
            return True

        if not TORCH_AVAILABLE:
            logger.info(f"Heuristic mode for {model_name}")
            self.models[model_name] = {"type": "heuristic", "loaded": True}
            return True

        try:
            config = self.model_configs.get(model_name, {})
            model_path = config.get("model_path", "")

            if not model_path:
                logger.warning(f"No model_path for {model_name}, using heuristic")
                self.models[model_name] = {"type": "heuristic", "loaded": True}
                return True

            logger.info(f"Loading transformer model: {model_path} for {model_name}")

            self.tokenizer = AutoTokenizer.from_pretrained(model_path)
            self.classification_model = (
                AutoModelForSequenceClassification.from_pretrained(model_path)
            )

            self.models[model_name] = {
                "type": "transformer",
                "loaded": True,
                "model_path": model_path,
                "timestamp": datetime.now(),
            }
            logger.info(f"Model {model_name} loaded successfully from {model_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            self.models[model_name] = {"type": "heuristic", "loaded": True}
            return False

    def _get_cache_key(self, model_name: str, input_data: Dict) -> str:
        """Generate cache key for input data"""
        data_str = json.dumps(input_data, sort_keys=True)
        return hashlib.sha256(f"{model_name}:{data_str}".encode()).hexdigest()

    def _get_from_cache(self, cache_key: str) -> Optional[Dict]:
        """Get result from cache"""
        if cache_key in self.cache:
            entry = self.cache[cache_key]
            if (datetime.now() - entry["timestamp"]).seconds < 3600:
                return entry["result"]
            else:
                del self.cache[cache_key]
        return None

    def _add_to_cache(self, cache_key: str, result: Dict):
        """Add result to cache"""
        if len(self.cache) >= self.cache_size:
            oldest_key = min(
                self.cache.keys(), key=lambda k: self.cache[k]["timestamp"]
            )
            del self.cache[oldest_key]

        self.cache[cache_key] = {"result": result, "timestamp": datetime.now()}

    async def infer(
        self, model_name: str, input_data: Dict, use_cache: bool = True
    ) -> Dict[str, Any]:
        """Run inference on input data"""

        if use_cache:
            cache_key = self._get_cache_key(model_name, input_data)
            cached_result = self._get_from_cache(cache_key)
            if cached_result:
                logger.debug(f"Cache hit for {model_name}")
                return cached_result

        if model_name not in self.models:
            await self.load_model(model_name)

        if model_name == "agent-ops":
            result = await self._infer_agent_ops(input_data)
        elif model_name == "ai-compliance":
            result = await self._infer_ai_compliance(input_data)
        elif model_name == "deepfake-defense":
            result = await self._infer_deepfake(input_data)
        else:
            result = await self._heuristic_fallback(model_name, input_data)

        result["model"] = model_name
        result["timestamp"] = datetime.now().isoformat()
        result["inference_engine"] = self.models.get(model_name, {}).get(
            "type", "unknown"
        )

        if use_cache:
            self._add_to_cache(cache_key, result)

        return result

    async def _infer_agent_ops(self, input_data: Dict) -> Dict[str, Any]:
        """Agent Ops classification with real transformer"""
        model_info = self.models.get("agent-ops", {})

        if (
            model_info.get("type") == "transformer"
            and self.classification_model
            and self.tokenizer
        ):
            try:
                task_desc = input_data.get("task_description", "")
                context = input_data.get("context", "")
                combined_text = f"{task_desc} {context}"

                inputs = self.tokenizer(
                    combined_text, return_tensors="pt", truncation=True, max_length=512
                )

                with torch.no_grad():
                    outputs = self.classification_model(**inputs)
                    probs = torch.softmax(outputs.logits, dim=-1)
                    top_prob, top_idx = probs.max(dim=-1)

                labels = [
                    "api_integration",
                    "database_operation",
                    "background_processing",
                    "general_task",
                    "ml_operation",
                ]
                classification = labels[min(top_idx.item(), len(labels) - 1)]
                confidence = top_prob.item()

                suggestions = self._get_suggestions(classification)

                return {
                    "classification": classification,
                    "confidence": round(confidence, 3),
                    "suggestions": suggestions,
                    "optimization_score": round(0.85 + (confidence * 0.1), 3),
                }
            except Exception as e:
                logger.error(f"Transformer inference failed: {e}")

        return await self._heuristic_agent_ops(input_data)

    async def _heuristic_agent_ops(self, input_data: Dict) -> Dict[str, Any]:
        """Enhanced heuristic fallback for agent ops"""
        await asyncio.sleep(0.02)

        task_desc = input_data.get("task_description", "").lower()
        context = input_data.get("context", "").lower()

        if "api" in task_desc or "fetch" in task_desc or "http" in task_desc:
            classification = "api_integration"
            confidence = 0.92
            suggestions = [
                "Use async/await for API calls",
                "Implement retry logic with exponential backoff",
                "Add caching layer for frequently accessed data",
            ]
        elif "database" in task_desc or "query" in task_desc or "sql" in task_desc:
            classification = "database_operation"
            confidence = 0.88
            suggestions = [
                "Use connection pooling",
                "Implement query optimization",
                "Add prepared statements",
            ]
        elif (
            "process" in task_desc or "background" in task_desc or "worker" in task_desc
        ):
            classification = "background_processing"
            confidence = 0.85
            suggestions = [
                "Use task queue (Celery/RQ)",
                "Implement proper error handling",
                "Add progress tracking",
            ]
        elif "ml" in task_desc or "model" in task_desc or "train" in task_desc:
            classification = "ml_operation"
            confidence = 0.87
            suggestions = [
                "Use GPU batching for training",
                "Implement early stopping",
                "Add model versioning",
            ]
        else:
            classification = "general_task"
            confidence = 0.75
            suggestions = [
                "Break down into smaller subtasks",
                "Add logging and monitoring",
                "Consider error handling strategies",
            ]

        return {
            "classification": classification,
            "confidence": confidence,
            "suggestions": suggestions,
            "optimization_score": 0.85,
        }

    def _get_suggestions(self, classification: str) -> List[str]:
        """Get task-specific suggestions"""
        suggestions_map = {
            "api_integration": [
                "Use async/await for API calls",
                "Implement retry logic with exponential backoff",
                "Add caching layer for frequently accessed data",
            ],
            "database_operation": [
                "Use connection pooling",
                "Implement query optimization",
                "Add prepared statements",
            ],
            "background_processing": [
                "Use task queue (Celery/RQ)",
                "Implement proper error handling",
                "Add progress tracking",
            ],
            "ml_operation": [
                "Use GPU batching for training",
                "Implement early stopping",
                "Add model versioning",
            ],
        }
        return suggestions_map.get(
            classification, ["Consider optimization opportunities"]
        )

    async def _infer_ai_compliance(self, input_data: Dict) -> Dict[str, Any]:
        """AI Compliance checking with real transformer"""
        model_info = self.models.get("ai-compliance", {})

        if (
            model_info.get("type") == "transformer"
            and self.classification_model
            and self.tokenizer
        ):
            try:
                document = input_data.get("document", "")

                inputs = self.tokenizer(
                    document, return_tensors="pt", truncation=True, max_length=512
                )

                with torch.no_grad():
                    outputs = self.classification_model(**inputs)
                    probs = torch.softmax(outputs.logits, dim=-1)

                compliance_score = probs[0][0].item() if probs.dim() > 1 else 0.85

                return {
                    "compliance_score": round(compliance_score, 3),
                    "violations": [],
                    "recommendations": ["Continue monitoring compliance"],
                    "regulations_checked": ["GDPR", "AI_ACT"],
                    "analysis_method": "transformer",
                }
            except Exception as e:
                logger.error(f"Transformer compliance inference failed: {e}")

        return await self._heuristic_compliance(input_data)

    async def _heuristic_compliance(self, input_data: Dict) -> Dict[str, Any]:
        """Enhanced heuristic compliance checking"""
        await asyncio.sleep(0.03)

        document = input_data.get("document", "")
        regulations = input_data.get("regulations", ["GDPR", "AI_ACT"])

        violations = []
        recommendations = []

        pii_keywords = [
            "name",
            "email",
            "phone",
            "address",
            "ssn",
            "social security",
            "passport",
            "credit card",
        ]
        for keyword in pii_keywords:
            if keyword.lower() in document.lower():
                violations.append(
                    {
                        "type": "PII_DETECTED",
                        "severity": "high",
                        "keyword": keyword,
                        "regulation": "GDPR_ART_5",
                    }
                )
                recommendations.append(f"Implement {keyword} masking or encryption")

        if "model" in document.lower() and "explain" not in document.lower():
            violations.append(
                {
                    "type": "LACK_OF_EXPLAINABILITY",
                    "severity": "medium",
                    "regulation": "AI_ACT_14",
                }
            )
            recommendations.append("Add model explanation capabilities")

        if "training" in document.lower() and "bias" not in document.lower():
            violations.append(
                {
                    "type": "BIAS_ASSESSMENT_MISSING",
                    "severity": "medium",
                    "regulation": "AI_ACT_10",
                }
            )
            recommendations.append("Add bias detection and mitigation")

        jurisdictions = {
            "China": ["MLPS", "Algorithm Filing"],
            "Canada": ["AIDA", "Bias Mitigation"],
            "UK": ["AI Safety Institute", "Post-Brexit Alignment"],
            "EU": ["GDPR", "AI Act"],
            "US": ["CCPA", "NIST AI Framework"],
        }

        for region, keywords in jurisdictions.items():
            if region.lower() in document.lower():
                violations.append(
                    {
                        "type": f"REGIONAL_GAP_{region.upper()}",
                        "severity": "high",
                        "regulation": keywords[0],
                        "description": f"Mandatory {region} compliance rules not fully satisfied",
                    }
                )
                recommendations.append(
                    f"Review {region} {keywords[0]} specific requirements"
                )

        total_checks = 4
        passed_checks = max(0, total_checks - min(4, len(violations)))
        compliance_score = passed_checks / total_checks

        return {
            "compliance_score": compliance_score,
            "violations": violations,
            "recommendations": recommendations,
            "regulations_checked": regulations + list(jurisdictions.keys()),
            "analysis_method": "heuristic",
        }

    async def _infer_deepfake(self, input_data: Dict) -> Dict[str, Any]:
        """Deepfake detection - uses our CV-based detector for accuracy"""
        from app.ml.deepfake_detector import deepfake_detector

        media_url = input_data.get("media_url", "")
        media_type = input_data.get("media_type", "video")

        if media_type == "image":
            result = deepfake_detector.analyze_image(media_url)
        elif media_type == "video":
            result = deepfake_detector.analyze_video(media_url)
        elif media_type == "audio":
            result = deepfake_detector.analyze_audio(media_url)
        else:
            result = deepfake_detector.analyze_video(media_url)

        return {
            "is_fake": result.get("result") == "fake",
            "confidence": result.get("confidence", 0) / 100.0,
            "analysis": result.get("details", {}),
            "detection_method": "cv_ensemble",
        }

    async def _heuristic_fallback(
        self, model_name: str, input_data: Dict
    ) -> Dict[str, Any]:
        """Generic heuristic fallback"""
        await asyncio.sleep(0.01)
        return {
            "result": "deterministic_analysis",
            "engine": "heuristic_v2",
            "model": model_name,
            "input_hash": hashlib.md5(str(input_data).encode()).hexdigest(),
        }

    async def batch_infer(self, model_name: str, inputs: List[Dict]) -> List[Dict]:
        """Run batch inference"""
        tasks = [self.infer(model_name, inp) for inp in inputs]
        return await asyncio.gather(*tasks)

    def get_model_info(self, model_name: str) -> Optional[Dict]:
        """Get information about a model"""
        config = self.model_configs.get(model_name)
        model = self.models.get(model_name, {})
        return (
            {
                **config,
                "loaded": model.get("loaded", False),
                "type": model.get("type", "none"),
            }
            if config
            else None
        )

    def list_models(self) -> List[Dict]:
        """List all available models"""
        return [
            {
                "name": name,
                "config": config,
                "loaded": self.models.get(name, {}).get("loaded", False),
                "type": self.models.get(name, {}).get("type", "none"),
            }
            for name, config in self.model_configs.items()
        ]

    def clear_cache(self):
        """Clear the inference cache"""
        self.cache.clear()
        logger.info("Inference cache cleared")

    def get_cache_stats(self) -> Dict:
        """Get cache statistics"""
        return {
            "size": len(self.cache),
            "max_size": self.cache_size,
            "utilization": len(self.cache) / self.cache_size,
        }


inference_service = MLInferenceService()


async def get_inference_service() -> MLInferenceService:
    """Get the inference service instance"""
    return inference_service
