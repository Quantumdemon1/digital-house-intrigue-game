import { GameState, GamePhase } from '../models/game-state';
import { Houseguest } from '../models/houseguest';
import { BigBrotherGame } from '../models/game/BigBrotherGame';
import {
    Relationship,
    RelationshipMap,
    getRelationshipDescription,
} from '../utils/RelationshipUtils';
import {
    getRelationshipDelta,
    getMoodSwing,
    getStatBoost,
    getInitialMood,
    getInitialStress,
} from '../utils/ai/generators';
import {
    classifyRelationship,
    getRelationshipClassificationDescription,
} from '../utils/ai/classify';
import {
    getOrCreateRelationship,
} from '../models/game-state';
import {
    getPersonalityDescription,
    getTraitCompatibilityDescription,
    getCompatibilityScore,
} from '../utils/PersonalityUtils';
import {
    getStrategicScore,
    getStrategicDescription,
} from '../utils/ai/strategy';
import {
    getPromiseDescription,
    PromiseType,
} from '../models/promise';
import {
    getFriendshipBoost,
    getFriendshipDescription,
} from '../utils/FriendshipUtils';
import {
    getTrustModifier,
    getTrustDescription,
} from '../utils/TrustUtils';
import {
    getRespectModifier,
    getRespectDescription,
} from '../utils/RespectUtils';
import {
    getFearModifier,
    getFearDescription,
} from '../utils/FearUtils';
import {
    getHateModifier,
    getHateDescription,
} from '../utils/HateUtils';
import {
    getAttractionModifier,
    getAttractionDescription,
} from '../utils/AttractionUtils';
import {
    getBoredomModifier,
    getBoredomDescription,
} from '../utils/BoredomUtils';
import {
    getAngerModifier,
    getAngerDescription,
} from '../utils/AngerUtils';
import {
    getJealousyModifier,
    getJealousyDescription,
} from '../utils/JealousyUtils';
import {
    getGuiltModifier,
    getGuiltDescription,
} from '../utils/GuiltUtils';
import {
    getEnvyModifier,
    getEnvyDescription,
} from '../utils/EnvyUtils';
import {
    getShameModifier,
    getShameDescription,
} from '../utils/ShameUtils';
import {
    getPrideModifier,
    getPrideDescription,
} from '../utils/PrideUtils';
import {
    getSadnessModifier,
    getSadnessDescription,
} from '../utils/SadnessUtils';
import {
    getHappinessModifier,
    getHappinessDescription,
} from '../utils/HappinessUtils';
import {
    getStressModifier,
    getStressDescription,
} from '../utils/StressUtils';
import {
    getEnergyModifier,
    getEnergyDescription,
} from '../utils/EnergyUtils';
import {
    getMotivationModifier,
    getMotivationDescription,
} from '../utils/MotivationUtils';
import {
    getConfidenceModifier,
    getConfidenceDescription,
} from '../utils/ConfidenceUtils';
import {
    getOptimismModifier,
    getOptimismDescription,
} from '../utils/OptimismUtils';
import {
    getResilienceModifier,
    getResilienceDescription,
} from '../utils/ResilienceUtils';
import {
    getSocialModifier,
    getSocialDescription,
} from '../utils/SocialUtils';
import {
    getIntelligenceModifier,
    getIntelligenceDescription,
} from '../utils/IntelligenceUtils';
import {
    getCreativityModifier,
    getCreativityDescription,
} from '../utils/CreativityUtils';
import {
    getEmpathyModifier,
    getEmpathyDescription,
} from '../utils/EmpathyUtils';
import {
    getLuckModifier,
    getLuckDescription,
} from '../utils/LuckUtils';
import {
    getCharismaModifier,
    getCharismaDescription,
} from '../utils/CharismaUtils';
import {
    getPhysicalModifier,
    getPhysicalDescription,
} from '../utils/PhysicalUtils';
import {
    getMentalModifier,
    getMentalDescription,
} from '../utils/MentalUtils';
import {
    getEmotionalModifier,
    getEmotionalDescription,
} from '../utils/EmotionalUtils';
import {
    getSpiritualModifier,
    getSpiritualDescription,
} from '../utils/SpiritualUtils';
import {
    getFinancialModifier,
    getFinancialDescription,
} from '../utils/FinancialUtils';
import {
    getProfessionalModifier,
    getProfessionalDescription,
} from '../utils/ProfessionalUtils';
import {
    getEducationalModifier,
    getEducationalDescription,
} from '../utils/EducationalUtils';
import {
    getFamilialModifier,
    getFamilialDescription,
} from '../utils/FamilialUtils';
import {
    getRomanticModifier,
    getRomanticDescription,
} from '../utils/RomanticUtils';
import {
    getPersonalModifier,
    getPersonalDescription,
} from '../utils/PersonalUtils';
import {
    getCommunityModifier,
    getCommunityDescription,
} from '../utils/CommunityUtils';
import {
    getWorldlyModifier,
    getWorldlyDescription,
} from '../utils/WorldlyUtils';
import {
    getExistentialModifier,
    getExistentialDescription,
} from '../utils/ExistentialUtils';
import {
    getMoralModifier,
    getMoralDescription,
} from '../utils/MoralUtils';
import {
    getEthicalModifier,
    getEthicalDescription,
} from '../utils/EthicalUtils';
import {
    getLegalModifier,
    getLegalDescription,
} from '../utils/LegalUtils';
import {
    getPoliticalModifier,
    getPoliticalDescription,
} from '../utils/PoliticalUtils';
import {
    getReligiousModifier,
    getReligiousDescription,
} from '../utils/ReligiousUtils';
import {
    getCulturalModifier,
    getCulturalDescription,
} from '../utils/CulturalUtils';
import {
    getTechnologicalModifier,
    getTechnologicalDescription,
} from '../utils/TechnologicalUtils';
import {
    getEnvironmentalModifier,
    getEnvironmentalDescription,
} from '../utils/EnvironmentalUtils';
import {
    getHistoricalModifier,
    getHistoricalDescription,
} from '../utils/HistoricalUtils';
import {
    getFutureModifier,
    getFutureDescription,
} from '../utils/FutureUtils';
import {
    getPastModifier,
    getPastDescription,
} from '../utils/PastUtils';
import {
    getPresentModifier,
    getPresentDescription,
} from '../utils/PresentUtils';
import {
    getRealityModifier,
    getRealityDescription,
} from '../utils/RealityUtils';
import {
    getVirtualModifier,
    getVirtualDescription,
} from '../utils/VirtualUtils';
import {
    getInnerModifier,
    getInnerDescription,
} from '../utils/InnerUtils';
import {
    getOuterModifier,
    getOuterDescription,
} from '../utils/OuterUtils';
import {
    getSubjectiveModifier,
    getSubjectiveDescription,
} from '../utils/SubjectiveUtils';
import {
    getObjectiveModifier,
    getObjectiveDescription,
} from '../utils/ObjectiveUtils';
import {
    getAbstractModifier,
    getAbstractDescription,
} from '../utils/AbstractUtils';
import {
    getConcreteModifier,
    getConcreteDescription,
} from '../utils/ConcreteUtils';
import {
    getSimpleModifier,
    getSimpleDescription,
} from '../utils/SimpleUtils';
import {
    getComplexModifier,
    getComplexDescription,
} from '../utils/ComplexUtils';
import {
    getKnownModifier,
    getKnownDescription,
} from '../utils/KnownUtils';
import {
    getUnknownModifier,
    getUnknownDescription,
} from '../utils/UnknownUtils';
import {
    getSafeModifier,
    getSafeDescription,
} from '../utils/SafeUtils';
import {
    getDangerousModifier,
    getDangerousDescription,
} from '../utils/DangerousUtils';
import {
    getGoodModifier,
    getGoodDescription,
} from '../utils/GoodUtils';
import {
    getEvilModifier,
    getEvilDescription,
} from '../utils/EvilUtils';
import {
    getBeautifulModifier,
    getBeautifulDescription,
} from '../utils/BeautifulUtils';
import {
    getUglyModifier,
    getUglyDescription,
} from '../utils/UglyUtils';
import {
    getHealthyModifier,
    getHealthyDescription,
} from '../utils/HealthyUtils';
import {
    getSickModifier,
    getSickDescription,
} from '../utils/SickUtils';
import {
    getAliveModifier,
    getAliveDescription,
} from '../utils/AliveUtils';
import {
    getDeadModifier,
    getDeadDescription,
} from '../utils/DeadUtils';
import {
    getFreeModifier,
    getFreeDescription,
} from '../utils/FreeUtils';
import {
    getImprisonedModifier,
    getImprisonedDescription,
} from '../utils/ImprisonedUtils';
import {
    getPowerfulModifier,
    getPowerfulDescription,
} from '../utils/PowerfulUtils';
import {
    getWeakModifier,
    getWeakDescription,
} from '../utils/WeakUtils';
import {
    getRichModifier,
    getRichDescription,
} from '../utils/RichUtils';
import {
    getPoorModifier,
    getPoorDescription,
} from '../utils/PoorUtils';
import {
    getSuccessfulModifier,
    getSuccessfulDescription,
} from '../utils/SuccessfulUtils';
import {
    getFailedModifier,
    getFailedDescription,
} from '../utils/FailedUtils';
import {
    getLovedModifier,
    getLovedDescription,
} from '../utils/LovedUtils';
import {
    getHatedModifier,
    getHatedDescription,
} from '../utils/HatedUtils';
import {
    getRememberedModifier,
    getRememberedDescription,
} from '../utils/RememberedUtils';
import {
    getForgottenModifier,
    getForgottenDescription,
} from '../utils/ForgottenUtils';
import {
    getInfluentialModifier,
    getInfluentialDescription,
} from '../utils/InfluentialUtils';
import {
    getIgnoredModifier,
    getIgnoredDescription,
} from '../utils/IgnoredUtils';
import {
    getConnectedModifier,
    getConnectedDescription,
} from '../utils/ConnectedUtils';
import {
    getDisconnectedModifier,
    getDisconnectedDescription,
} from '../utils/DisconnectedUtils';
import {
    getIncludedModifier,
    getIncludedDescription,
} from '../utils/IncludedUtils';
import {
    getExcludedModifier,
    getExcludedDescription,
} from '../utils/ExcludedUtils';
import {
    getRespectedModifier,
    getRespectedDescription,
} from '../utils/RespectedUtils';
import {
    getDisrespectedModifier,
    getDisrespectedDescription,
} from '../utils/DisrespectedUtils';
import {
    getTrustedModifier,
    getTrustedDescription,
} from '../utils/TrustedUtils';
import {
    getDistrustedModifier,
    getDistrustedDescription,
} from '../utils/DistrustedUtils';
import {
    getFearedModifier,
    getFearedDescription,
} from '../utils/FearedUtils';
import {
    getUnafraidModifier,
    getUnafraidDescription,
} from '../utils/UnafraidUtils';
import {
    getHumbleModifier,
    getHumbleDescription,
} from '../utils/HumbleUtils';
import {
    getArrogantModifier,
    getArrogantDescription,
} from '../utils/ArrogantUtils';
import {
    getHonestModifier,
    getHonestDescription,
} from '../utils/HonestUtils';
import {
    getDeceptiveModifier,
    getDeceptiveDescription,
} from '../utils/DeceptiveUtils';
import {
    getKindModifier,
    getKindDescription,
} from '../utils/KindUtils';
import {
    getCruelModifier,
    getCruelDescription,
} from '../utils/CruelUtils';
import {
    getGenerousModifier,
    getGenerousDescription,
} from '../utils/GenerousUtils';
import {
    getSelfishModifier,
    getSelfishDescription,
} from '../utils/SelfishUtils';
import {
    getLoyalModifier,
    getLoyalDescription,
} from '../utils/LoyalUtils';
import {
    getBetrayingModifier,
    getBetrayingDescription,
} from '../utils/BetrayingUtils';
import {
    getBraveModifier,
    getBraveDescription,
} from '../utils/BraveUtils';
import {
    getCowardlyModifier,
    getCowardlyDescription,
} from '../utils/CowardlyUtils';
import {
    getOptimisticModifier,
    getOptimisticDescription,
} from '../utils/OptimisticUtils';
import {
    getPessimisticModifier,
    getPessimisticDescription,
} from '../utils/PessimisticUtils';
import {
    getCalmModifier,
    getCalmDescription,
} from '../utils/CalmUtils';
import {
    getAnxiousModifier,
    getAnxiousDescription,
} from '../utils/AnxiousUtils';
import {
    getConfidentModifier,
    getConfidentDescription,
} from '../utils/ConfidentUtils';
import {
    getInsecureModifier,
    getInsecureDescription,
} from '../utils/InsecureUtils';
import {
    getPatientModifier,
    getPatientDescription,
} from '../utils/PatientUtils';
import {
    getImpatientModifier,
    getImpatientDescription,
} from '../utils/ImpatientUtils';
import {
    getOrganizedModifier,
    getOrganizedDescription,
} from '../utils/OrganizedUtils';
import {
    getDisorganizedModifier,
    getDisorganizedDescription,
} from '../utils/DisorganizedUtils';
import {
    getCreativeModifier,
    getCreativeDescription,
} from '../utils/CreativeUtils';
import {
    getUncreativeModifier,
    getUncreativeDescription,
} from '../utils/UncreativeUtils';
import {
    getIntelligentModifier,
    getIntelligentDescription,
} from '../utils/IntelligentUtils';
import {
    getUnintelligentModifier,
    getUnintelligentDescription,
} from '../utils/UnintelligentUtils';
import {
    getSocialModifier as getSociableModifier,
    getSocialDescription as getSociableDescription,
} from '../utils/SocialUtils';
import {
    getAntisocialModifier,
    getAntisocialDescription,
} from '../utils/AntisocialUtils';
import {
    getLeaderModifier,
    getLeaderDescription,
} from '../utils/LeaderUtils';
import {
    getFollowerModifier,
    getFollowerDescription,
} from '../utils/FollowerUtils';
import {
    getDominantModifier,
    getDominantDescription,
} from '../utils/DominantUtils';
import {
    getSubmissiveModifier,
    getSubmissiveDescription,
} from '../utils/SubmissiveUtils';
import {
    getAssertiveModifier,
    getAssertiveDescription,
} from '../utils/AssertiveUtils';
import {
    getPassiveModifier,
    getPassiveDescription,
} from '../utils/PassiveUtils';
import {
    getIndependentModifier,
    getIndependentDescription,
} from '../utils/IndependentUtils';
import {
    getDependentModifier,
    getDependentDescription,
} from '../utils/DependentUtils';
import {
    getResponsibleModifier,
    getResponsibleDescription,
} from '../utils/ResponsibleUtils';
import {
    getIrresponsibleModifier,
    getIrresponsibleDescription,
} from '../utils/IrresponsibleUtils';
import {
    getMatureModifier,
    getMatureDescription,
} from '../utils/MatureUtils';
import {
    getImmatureModifier,
    getImmatureDescription,
} from '../utils/ImmatureUtils';
import {
    getOpenMindedModifier,
    getOpenMindedDescription,
} from '../utils/OpenMindedUtils';
import {
    getCloseMindedModifier,
    getCloseMindedDescription,
} from '../utils/CloseMindedUtils';
import {
    getFlexibleModifier,
    getFlexibleDescription,
} from '../utils/FlexibleUtils';
import {
    getInflexibleModifier,
    getInflexibleDescription,
} from '../utils/InflexibleUtils';
import {
    getAdaptableModifier,
    getAdaptableDescription,
} from '../utils/AdaptableUtils';
import {
    getUnadaptableModifier,
    getUnadaptableDescription,
} from '../utils/UnadaptableUtils';
import {
    getPracticalModifier,
    getPracticalDescription,
} from '../utils/PracticalUtils';
import {
    getImpracticalModifier,
    getImpracticalDescription,
} from '../utils/ImpracticalUtils';
import {
    getLogicalModifier,
    getLogicalDescription,
} from '../utils/LogicalUtils';
import {
    getIllogicalModifier,
    getIllogicalDescription,
} from '../utils/IllogicalUtils';
import {
    getRationalModifier,
    getRationalDescription,
} from '../utils/RationalUtils';
import {
    getIrrationalModifier,
    getIrrationalDescription,
} from '../utils/IrrationalUtils';
import {
    getObjectiveModifier as getObjectiveMindedModifier,
    getObjectiveDescription as getObjectiveMindedDescription,
} from '../utils/ObjectiveUtils';
import {
    getSubjectiveModifier as getSubjectiveMindedModifier,
    getSubjectiveDescription as getSubjectiveMindedDescription,
} from '../utils/SubjectiveUtils';
import {
    getRealisticModifier,
    getRealisticDescription,
} from '../utils/RealisticUtils';
import {
    getIdealisticModifier,
    getIdealisticDescription,
} from '../utils/IdealisticUtils';
import {
    getTraditionalModifier,
    getTraditionalDescription,
} from '../utils/TraditionalUtils';
import {
    getModernModifier,
    getModernDescription,
} from '../utils/ModernUtils';
import {
    getConservativeModifier,
    getConservativeDescription,
} from '../utils/ConservativeUtils';
import {
    getLiberalModifier,
    getLiberalDescription,
} from '../utils/LiberalUtils';
import {
    getSpontaneousModifier,
    getSpontaneousDescription,
} from '../utils/SpontaneousUtils';
import {
    getPlannedModifier,
    getPlannedDescription,
} from '../utils/PlannedUtils';
import {
    getCarefulModifier,
    getCarefulDescription,
} from '../utils/CarefulUtils';
import {
    getRecklessModifier,
    getRecklessDescription,
} from '../utils/RecklessUtils';
import {
    getDisciplinedModifier,
    getDisciplinedDescription,
} from '../utils/DisciplinedUtils';
import {
    getUndisciplinedModifier,
    getUndisciplinedDescription,
} from '../utils/UndisciplinedUtils';
import {
    getPersistentModifier,
    getPersistentDescription,
} from '../utils/PersistentUtils';
import {
    getUnpersistentModifier,
    getUnpersistentDescription,
} from '../utils/UnpersistentUtils';
import {
    getDeterminedModifier,
    getDeterminedDescription,
} from '../utils/DeterminedUtils';
import {
    getUndeterminedModifier,
    getUndeterminedDescription,
} from '../utils/UndeterminedUtils';
import {
    getAmbitiousModifier,
    getAmbitiousDescription,
} from '../utils/AmbitiousUtils';
import {
    getUnambitiousModifier,
    getUnambitiousDescription,
} from '../utils/UnambitiousUtils';
import {
    getSuccessfulModifier as getAchievementOrientedModifier,
    getSuccessfulDescription as getAchievementOrientedDescription,
} from '../utils/SuccessfulUtils';
import {
    getFailedModifier as getAvoidanceOrientedModifier,
    getFailedDescription as getAvoidanceOrientedDescription,
} from '../utils/FailedUtils';
import {
    getPerfectionistModifier,
    getPerfectionistDescription,
} from '../utils/PerfectionistUtils';
import {
    getNonPerfectionistModifier,
    getNonPerfectionistDescription,
} from '../utils/NonPerfectionistUtils';
import {
    getDetailOrientedModifier,
    getDetailOrientedDescription,
} from '../utils/DetailOrientedUtils';
import {
    getBigPictureModifier,
    getBigPictureDescription,
} from '../utils/BigPictureUtils';
import {
    getAnalyticalModifier,
    getAnalyticalDescription,
} from '../utils/AnalyticalUtils';
import {
    getIntuitiveModifier,
    getIntuitiveDescription,
} from '../utils/IntuitiveUtils';
import {
    getSystematicModifier,
    getSystematicDescription,
} from '../utils/SystematicUtils';
import {
    getUnsystematicModifier,
    getUnsystematicDescription,
} from '../utils/UnsystematicUtils';
import {
    getStructuredModifier,
    getStructuredDescription,
} from '../utils/StructuredUtils';
import {
    getUnstructuredModifier,
    getUnstructuredDescription,
} from '../utils/UnstructuredUtils';
import {
    getOrganizedModifier as getOrderlyModifier,
    getOrganizedDescription as getOrderlyDescription,
} from '../utils/OrganizedUtils';
import {
    getDisorganizedModifier as getDisorderlyModifier,
    getDisorganizedDescription as getDisorderlyDescription,
} from '../utils/DisorganizedUtils';
import {
    getCleanModifier,
    getCleanDescription,
} from '../utils/CleanUtils';
import {
    getDirtyModifier,
    getDirtyDescription,
} from '../utils/DirtyUtils';
import {
    getEfficientModifier,
    getEfficientDescription,
} from '../utils/EfficientUtils';
import {
    getInefficientModifier,
    getInefficientDescription,
} from '../utils/InefficientUtils';
import {
    getPracticalModifier as getResourcefulModifier,
    getPracticalDescription as getResourcefulDescription,
} from '../utils/PracticalUtils';
import {
    getImpracticalModifier as getWastefulModifier,
    getImpracticalDescription as getWastefulDescription,
} from '../utils/ImpracticalUtils';
import {
    getThriftyModifier,
    getThriftyDescription,
} from '../utils/ThriftyUtils';
import {
    getExtravagantModifier,
    getExtravagantDescription,
} from '../utils/ExtravagantUtils';
import {
    getMinimalistModifier,
    getMinimalistDescription,
} from '../utils/MinimalistUtils';
import {
    getMaterialisticModifier,
    getMaterialisticDescription,
} from '../utils/MaterialisticUtils';
import {
    getSaverModifier,
    getSaverDescription,
} from '../utils/SaverUtils';
import {
    getSpenderModifier,
    getSpenderDescription,
} from '../utils/SpenderUtils';
import {
    getRiskAverseModifier,
    getRiskAverseDescription,
} from '../utils/RiskAverseUtils';
import {
    getRiskTakingModifier,
    getRiskTakingDescription,
} from '../utils/RiskTakingUtils';
import {
    getCautiousModifier,
    getCautiousDescription,
} from '../utils/CautiousUtils';
import {
    getImpulsiveModifier,
    getImpulsiveDescription,
} from '../utils/ImpulsiveUtils';
import {
    getDeliberateModifier,
    getDeliberateDescription,
} from '../utils/DeliberateUtils';
import {
    getHastyModifier,
    getHastyDescription,
} from '../utils/HastyUtils';
import {
    getPatientModifier as getLongTermModifier,
    getPatientDescription as getLongTermDescription,
} from '../utils/PatientUtils';
import {
    getImpatientModifier as getShortTermModifier,
    getImpatientDescription as getShortTermDescription,
} from '../utils/ImpatientUtils';
import {
    getFrugalModifier,
    getFrugalDescription,
} from '../utils/FrugalUtils';
import {
    getLavishModifier,
    getLavishDescription,
} from '../utils/LavishUtils';
import {
    getModestModifier,
    getModestDescription,
} from '../utils/ModestUtils';
import {
    getOstentatiousModifier,
    getOstentatiousDescription,
} from '../utils/OstentatiousUtils';
import {
    getReservedModifier,
    getReservedDescription,
} from '../utils/ReservedUtils';
import {
    getShowyModifier,
    getShowyDescription,
} from '../utils/ShowyUtils';
import {
    getSimpleModifier as getUnpretentiousModifier,
    getSimpleDescription as getUnpretentiousDescription,
} from '../utils/SimpleUtils';
import {
    getComplexModifier as getPretentiousModifier,
    getComplexDescription as getPretentiousDescription,
} from '../utils/ComplexUtils';
import {
    getDownToEarthModifier,
    getDownToEarthDescription,
} from '../utils/DownToEarthUtils';
import {
    getHighAndMightyModifier,
    getHighAndMightyDescription,
} from '../utils/HighAndMightyUtils';
import {
    getHumbleModifier as getSelfEffacingModifier,
    getHumbleDescription as getSelfEffacingDescription,
} from '../utils/HumbleUtils';
import {
    getArrogantModifier as getSelfAggrandizingModifier,
    getArrogantDescription as getSelfAggrandizingDescription,
} from '../utils/ArrogantUtils';
import {
    getSelfDeprecatingModifier,
    getSelfDeprecatingDescription,
} from '../utils/SelfDeprecatingUtils';
import {
    getSelfPromotingModifier,
    getSelfPromotingDescription,
} from '../utils/SelfPromotingUtils';
import {
    getSelfAwareModifier,
    getSelfAwareDescription,
} from '../utils/SelfAwareUtils';
import {
    getSelfUnawareModifier,
    getSelfUnawareDescription,
} from '../utils/SelfUnawareUtils';
import {
    getSelfControlledModifier,
    getSelfControlledDescription,
} from '../utils/SelfControlledUtils';
import {
    getSelfIndulgentModifier,
    getSelfIndulgentDescription,
} from '../utils/SelfIndulgentUtils';
import {
    getSelfReliantModifier,
    getSelfReliantDescription,
} from '../utils/SelfReliantUtils';
import {
    getSelfDoubtingModifier,
    getSelfDoubtingDescription,
} from '../utils/SelfDoubtingUtils';
import {
    getSelfAcceptingModifier,
    getSelfAcceptingDescription,
} from '../utils/SelfAcceptingUtils';
import {
    getSelfCriticalModifier,
    getSelfCriticalDescription,
} from '../utils/SelfCriticalUtils';
import {
    getSelfForgivingModifier,
    getSelfForgivingDescription,
} from '../utils/SelfForgivingUtils';
import {
    getSelfPunishingModifier,
    getSelfPunishingDescription,
} from '../utils/SelfPunishingUtils';
import {
    getSelfRespectingModifier,
    getSelfRespectingDescription,
} from '../utils/SelfRespectingUtils';
import {
    getSelfLoathingModifier,
    getSelfLoathingDescription,
} from '../utils/SelfLoathingUtils';
import {
    getSelfConfidentModifier,
    getSelfConfidentDescription,
} from '../utils/SelfConfidentUtils';
import {
    getSelfConsciousModifier,
    getSelfConsciousDescription,
} from '../utils/SelfConsciousUtils';
import {
    getSelfAssuredModifier,
    getSelfAssuredDescription,
} from '../utils/SelfAssuredUtils';
import {
    getSelfPossessedModifier,
    getSelfPossessedDescription,
} from '../utils/SelfPossessedUtils';
import {
    getSelfSufficientModifier,
    getSelfSufficientDescription,
} from '../utils/SelfSufficientUtils';
import {
    getSelfDestructiveModifier,
    getSelfDestructiveDescription,
} from '../utils/SelfDestructiveUtils';
import {
    getSelfImprovingModifier,
    getSelfImprovingDescription,
} from '../utils/SelfImprovingUtils';
import {
    getSelfSabotagingModifier,
    getSelfSabotagingDescription,
} from '../utils/SelfSabotagingUtils';
import {
    getSelfDisciplinedModifier,
    getSelfDisciplinedDescription,
} from '../utils/SelfDisciplinedUtils';
import {
    getSelfIndulgentModifier as getSelfGratifyingModifier,
    getSelfIndulgentDescription as getSelfGratifyingDescription,
} from '../utils/SelfIndulgentUtils';
import {
    getSelfMotivatedModifier,
    getSelfMotivatedDescription,
} from '../utils/SelfMotivatedUtils';
import {
    getSelfPityingModifier,
    getSelfPityingDescription,
} from '../utils/SelfPityingUtils';
import {
    getSelfReliantModifier as getSelfSupportingModifier,
    getSelfReliantDescription as getSelfSupportingDescription,
} from '../utils/SelfReliantUtils';
import {
    getSelfSufficientModifier as getSelfContainedModifier,
    getSelfSufficientDescription as getSelfContainedDescription,
} from '../utils/SelfSufficientUtils';
import {
    getSelfImprovingModifier as getSelfDevelopingModifier,
    getSelfImprovingDescription as getSelfDevelopingDescription,
} from '../utils/SelfImprovingUtils';
import {
    getSelfDisciplinedModifier as getSelfGovernedModifier,
    getSelfDisciplinedDescription as getSelfGovernedDescription,
} from '../utils/SelfDisciplinedUtils';
import {
    getSelfMotivatedModifier as getSelfStartingModifier,
    getSelfMotivatedDescription as getSelfStartingDescription,
} from '../utils/SelfMotivatedUtils';
import {
    getSelfAcceptingModifier as getSelfApprovingModifier,
    getSelfAcceptingDescription as getSelfApprovingDescription,
} from '../utils/SelfAcceptingUtils';
import {
    getSelfRespectingModifier as getSelfEsteemingModifier,
    getSelfRespectingDescription as getSelfEsteemingDescription,
} from '../utils/SelfRespectingUtils';
import {
    getSelfConfidentModifier as getSelfAssuredModifier2,
    getSelfConfidentDescription as getSelfAssuredDescription2,
} from '../utils/SelfConfidentUtils';
import {
    getSelfControlledModifier as getSelfRestrainedModifier,
    getSelfControlledDescription as getSelfRestrainedDescription,
} from '../utils/SelfControlledUtils';
import {
    getSelfReliantModifier as getSelfSustainingModifier,
    getSelfReliantDescription as getSelfSustainingDescription,
} from '../utils/SelfReliantUtils';
import {
    getSelfSufficientModifier as getSelfReliantModifier2,
    getSelfSufficientDescription as getSelfReliantDescription2,
} from '../utils/SelfSufficientUtils';
import {
    getSelfImprovingModifier as getSelfActualizingModifier,
    getSelfImprovingDescription as getSelfActualizingDescription,
} from '../utils/SelfImprovingUtils';
import {
    getSelfDisciplinedModifier as getSelfRegulatedModifier,
    getSelfDisciplinedDescription as getSelfRegulatedDescription,
} from '../utils/SelfDisciplinedUtils';
import {
    getSelfMotivatedModifier as getSelfDirectedModifier,
    getSelfMotivatedDescription as getSelfDirectedDescription,
} from '../utils/SelfMotivatedUtils';
import {
    getSelfAcceptingModifier as getSelfValuingModifier,
    getSelfAcceptingDescription as getSelfValuingDescription,
} from '../utils/SelfAcceptingUtils';
import {
    getSelfRespectingModifier as getSelfRegardingModifier,
    getSelfRespectingDescription as getSelfRegardingDescription,
} from '../utils/SelfRespectingUtils';
import {
    getSelfConfidentModifier as getSelfBelievingModifier,
    getSelfConfidentDescription as getSelfBelievingDescription,
} from '../utils/SelfConfidentUtils';
import {
    getSelfControlledModifier as getSelfDisciplinedModifier2,
    getSelfControlledDescription as getSelfDisciplinedDescription2,
} from '../utils/SelfControlledUtils';
import {
    getSelfReliantModifier as getSelfGoverningModifier,
    getSelfReliantDescription as getSelfGoverningDescription,
} from '../utils/SelfReliantUtils';
import {
    getSelfSufficientModifier as getSelfControllingModifier,
    getSelfSufficientDescription as getSelfControllingDescription,
} from '../utils/SelfSufficientUtils';
import {
    getSelfImprovingModifier as getSelfPerfectingModifier,
    getSelfImprovingDescription as getSelfPerfectingDescription,
} from '../utils/SelfImprovingUtils';
import {
    getSelfDisciplinedModifier as getSelfMasteredModifier,
    getSelfDisciplinedDescription as getSelfMasteredDescription,
} from '../utils/SelfDisciplinedUtils';
import {
    getSelfMotivatedModifier as getSelfPropelledModifier,
    getSelfMotivatedDescription as getSelfPropelledDescription,
} from '../utils/SelfMotivatedUtils';
import {
    getSelfAcceptingModifier as getSelfEmbracingModifier,
    getSelfAcceptingDescription as getSelfEmbracingDescription,
} from '../utils/SelfAcceptingUtils';
import {
    getSelfRespectingModifier as getSelfAppreciatingModifier,
    getSelfRespectingDescription as getSelfAppreciatingDescription,
} from '../utils/SelfRespectingUtils';
import {
    getSelfConfidentModifier as getSelfTrustingModifier,
    getSelfConfidentDescription as getSelfTrustingDescription,
} from '../utils/SelfConfidentUtils';
import {
    getSelfControlledModifier as getSelfCommandingModifier,
    getSelfControlledDescription as getSelfCommandingDescription,
} from '../utils/SelfControlledUtils';
import {
    getSelfReliantModifier as getSelfDirectingModifier,
    getSelfReliantDescription as getSelfDirectingDescription,
} from '../utils/SelfReliantUtils';
import {
    getSelfSufficientModifier as getSelfRulingModifier,
    getSelfSufficientDescription as getSelfRulingDescription,
} from '../utils/SelfSufficientUtils';
import {
    getSelfImprovingModifier as getSelfTranscendingModifier,
    getSelfImprovingDescription as getSelfTranscendingDescription,
} from '../utils/SelfImprovingUtils';
import {
    getSelfDisciplinedModifier as getSelfPossessedModifier2,
    getSelfDisciplinedDescription as getSelfPossessedDescription2,
} from '../utils/SelfDisciplinedUtils';
import {
    getSelfMotivatedModifier as getSelfActuatingModifier,
    getSelfMotivatedDescription as getSelfActuatingDescription,
} from '../utils/SelfMotivatedUtils';
import {
    getSelfAcceptingModifier as getSelfAffirmingModifier,
    getSelfAcceptingDescription as getSelfAffirmingDescription,
} from '../utils/SelfAcceptingUtils';
import {
