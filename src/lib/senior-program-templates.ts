// ─── Templates de missions seniors — Lot 24 ────────────────────────────

export type SeniorMissionTemplate = {
  code: string
  name: string
  type: string
  description: string
  estimatedDurationHours?: number
  estimatedTime?: number
  category: string
  precaution?: string
}

export const SENIOR_MISSION_TEMPLATES: SeniorMissionTemplate[] = [
  {
    code: "FRIENDLY_VISIT",
    name: "Visite conviviale",
    type: "Service solidaire",
    description: "Passer du temps avec un senior isolé — discussion, jeu, lecture, ou simple présence bienveillante.",
    estimatedDurationHours: 2,
    estimatedTime: 2,
    category: "visite",
  },
  {
    code: "DIGITAL_BUDDY",
    name: "Digital Buddy",
    type: "Mission Mentor",
    description: "Aider un senior à utiliser son smartphone, WhatsApp, ou ses emails en toute simplicité.",
    estimatedDurationHours: 1,
    estimatedTime: 2,
    category: "numérique",
  },
  {
    code: "WHATSAPP_FAMILY",
    name: "Atelier WhatsApp famille",
    type: "Mission Mentor",
    description: "Aider plusieurs seniors à communiquer avec leur famille via messagerie et appels vidéo.",
    estimatedDurationHours: 2,
    estimatedTime: 3,
    category: "numérique",
  },
  {
    code: "GROCERY_SUPPORT",
    name: "Accompagnement courses",
    type: "Service solidaire",
    description: "Accompagner un senior pour des courses simples (marché, supermarché, pharmacie).",
    estimatedDurationHours: 2,
    estimatedTime: 2,
    category: "courses",
  },
  {
    code: "APPOINTMENT_SUPPORT",
    name: "Accompagnement rendez-vous",
    type: "Service solidaire",
    description: "Accompagner à un rendez-vous non médicalisé (mairie, banque, démarche administrative).",
    estimatedDurationHours: 2,
    estimatedTime: 3,
    category: "accompagnement",
  },
  {
    code: "COFFEE_CHAT",
    name: "Café conversation",
    type: "Alliance Heroes",
    description: "Moment collectif de discussion autour d'un café — ouvert aux seniors et Heroes du quartier.",
    estimatedDurationHours: 2,
    estimatedTime: 2,
    category: "collectif",
  },
  {
    code: "WALK_SUPPORT",
    name: "Balade accompagnée",
    type: "Service solidaire",
    description: "Marche douce dans le quartier, au parc ou au marché — pour maintenir le lien et l'activité.",
    estimatedDurationHours: 1,
    estimatedTime: 2,
    category: "activité",
  },
  {
    code: "WEEKLY_CALL",
    name: "Appel hebdomadaire",
    type: "Service solidaire",
    description: "Appel de convivialité régulier pour prendre des nouvelles et rompre l'isolement téléphonique.",
    estimatedDurationHours: 1,
    estimatedTime: 1,
    category: "appel",
  },
  {
    code: "SUPPORT_CIRCLE",
    name: "Cercle de soutien senior",
    type: "Escouade Renfort",
    description: "Plusieurs Heroes organisés autour d'un senior pour des visites régulières et un suivi informel.",
    estimatedDurationHours: 3,
    estimatedTime: 4,
    category: "collectif",
  },
  {
    code: "SIMPLE_ADMIN_HELP",
    name: "Aide administrative simple",
    type: "Service solidaire",
    description: "Aide non juridique et non médicale pour des formulaires simples, courriers, ou démarches en ligne.",
    estimatedDurationHours: 1,
    estimatedTime: 2,
    category: "administratif",
  },
]

export function getSeniorMissionTemplates(): SeniorMissionTemplate[] {
  return SENIOR_MISSION_TEMPLATES
}

export function getSeniorMissionTemplateByCode(code: string): SeniorMissionTemplate | undefined {
  return SENIOR_MISSION_TEMPLATES.find((t) => t.code === code)
}

export const MISSION_PRECAUTION_TEXT =
  "Ces missions ne remplacent pas un service médical, social ou d'urgence. En cas d'urgence, contactez les services compétents."
