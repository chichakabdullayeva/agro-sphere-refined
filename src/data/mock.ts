// Mock dataset for AgroAzər modules. Replace with Cloud queries in Faza 3.

export const REGIONS = [
  "Bakı", "Şəmkir", "Quba", "Lənkəran", "Gəncə", "Sabirabad",
  "Salyan", "Qax", "Tovuz", "Göyçay", "Şəki", "Masallı",
] as const;

export type Equipment = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: "Traktor" | "Kombayn" | "Dron" | "Toxumsəpən" | "Şum" | "Biçin";
  powerKw: number;
  fuel: "Dizel" | "Benzin" | "Elektrik";
  pricePerHour: number;
  pricePerDay: number;
  region: string;
  district: string;
  insured: boolean;
  status: "AVAILABLE" | "BUSY" | "MAINTENANCE";
  owner: { name: string; rating: number; rentals: number };
  image: string;
};

export const EQUIPMENT: Equipment[] = [
  {
    id: "eq-1", name: "John Deere 6155M", brand: "John Deere", model: "6155M",
    year: 2022, type: "Traktor", powerKw: 115, fuel: "Dizel",
    pricePerHour: 45, pricePerDay: 280, region: "Şəmkir", district: "Mərkəz",
    insured: true, status: "AVAILABLE",
    owner: { name: "AgroTeknik MMC", rating: 4.8, rentals: 142 },
    image: "https://images.unsplash.com/photo-1605338803155-8b18b7b9d437?w=800&q=70",
  },
  {
    id: "eq-2", name: "Claas Lexion 5300", brand: "Claas", model: "Lexion 5300",
    year: 2021, type: "Kombayn", powerKw: 230, fuel: "Dizel",
    pricePerHour: 95, pricePerDay: 650, region: "Sabirabad", district: "Qarabağlı",
    insured: true, status: "BUSY",
    owner: { name: "Şərq Aqro", rating: 4.6, rentals: 78 },
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=70",
  },
  {
    id: "eq-3", name: "DJI Agras T40", brand: "DJI", model: "Agras T40",
    year: 2023, type: "Dron", powerKw: 9, fuel: "Elektrik",
    pricePerHour: 35, pricePerDay: 220, region: "Quba", district: "Mərkəz",
    insured: true, status: "AVAILABLE",
    owner: { name: "SkyAgro", rating: 4.9, rentals: 56 },
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=70",
  },
  {
    id: "eq-4", name: "MTZ Belarus 82.1", brand: "MTZ", model: "Belarus 82.1",
    year: 2019, type: "Traktor", powerKw: 60, fuel: "Dizel",
    pricePerHour: 22, pricePerDay: 150, region: "Lənkəran", district: "Mərkəz",
    insured: false, status: "AVAILABLE",
    owner: { name: "Cənub Texnika", rating: 4.4, rentals: 213 },
    image: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=800&q=70",
  },
  {
    id: "eq-5", name: "Amazone D9-30", brand: "Amazone", model: "D9-30",
    year: 2020, type: "Toxumsəpən", powerKw: 0, fuel: "Dizel",
    pricePerHour: 18, pricePerDay: 110, region: "Gəncə", district: "Goranboy",
    insured: true, status: "MAINTENANCE",
    owner: { name: "Qərb Agro", rating: 4.5, rentals: 67 },
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=70",
  },
];

export type Job = {
  id: string;
  title: string;
  taskType: string;
  description: string;
  region: string;
  district: string;
  startDate: string;
  endDate: string;
  workersNeeded: number;
  skills: string[];
  dailyRate: number;
  applications: number;
  urgent: boolean;
  employer: { name: string; rating: number };
};

export const JOBS: Job[] = [
  {
    id: "job-1", title: "Üzüm bağında dərmanlama",
    taskType: "Dərmanlama",
    description: "20 hektar üzüm bağında 3 gün ərzində kompleks dərmanlama işləri.",
    region: "Şəmkir", district: "Çinarlı",
    startDate: "18 May", endDate: "20 May",
    workersNeeded: 4, skills: ["Dərmanlama", "Şəxsi qoruyucu vasitə"],
    dailyRate: 85, applications: 12, urgent: true,
    employer: { name: "Şəmkir Üzümçülük MMC", rating: 4.7 },
  },
  {
    id: "job-2", title: "Pomidor yığımı — mövsümi",
    taskType: "Yığım",
    description: "Salyan rayonunda 15 gün davamlı pomidor yığımı, gündəlik norma var.",
    region: "Salyan", district: "Mərkəz",
    startDate: "22 May", endDate: "5 İyun",
    workersNeeded: 12, skills: ["Yığım", "Çəkmə"],
    dailyRate: 65, applications: 38, urgent: false,
    employer: { name: "Aqro Cənub", rating: 4.5 },
  },
  {
    id: "job-3", title: "Aqronom — istixana",
    taskType: "Aqronom",
    description: "Müasir istixana kompleksində daimi aqronom. Diplomu olanlar üstünlük.",
    region: "Quba", district: "Vəlvələçay",
    startDate: "1 İyun", endDate: "Daimi",
    workersNeeded: 1, skills: ["Aqronom", "Hidroponik", "Bitki xəstəlikləri"],
    dailyRate: 180, applications: 6, urgent: false,
    employer: { name: "Quba GreenTech", rating: 4.9 },
  },
  {
    id: "job-4", title: "Traktor sürücüsü — şum",
    taskType: "Sürücülük",
    description: "10 gün ərzində 80 hektar əkin sahəsində şum işi. Texnika təmin olunur.",
    region: "Tovuz", district: "Düzqırıqlı",
    startDate: "20 May", endDate: "30 May",
    workersNeeded: 2, skills: ["Traktor sürücülüyü", "Şum"],
    dailyRate: 110, applications: 9, urgent: true,
    employer: { name: "Tovuz AgroFarm", rating: 4.6 },
  },
];

export type CommunityPost = {
  id: string;
  author: { name: string; region: string; isExpert: boolean };
  timeAgo: string;
  content: string;
  tags: string[];
  image?: string;
  upvotes: number;
  comments: number;
  aiAnalysis?: { disease: string; confidence: number; treatment: string[] };
};

export const POSTS: CommunityPost[] = [
  {
    id: "p-1",
    author: { name: "Elşən Məmmədov", region: "Şəmkir", isExpert: false },
    timeAgo: "1 saat əvvəl",
    content:
      "Pomidor kollarında yarpaqlar saralır və qara ləkələr peyda olub. Bu nə ola bilər? Şəkil əlavə etdim.",
    tags: ["#pomidor_xəstəliyi", "#alternaria"],
    image: "https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=800&q=70",
    upvotes: 24, comments: 8,
    aiAnalysis: {
      disease: "Alternaria yanığı",
      confidence: 87,
      treatment: [
        "Xəstə yarpaqları dərhal təmizləyin və yandırın",
        "Mis tərkibli fungisid (Bordo məhlulu 1%) tətbiq edin",
        "Suvarmanı kök altına yönəldin, yarpaqları islatmayın",
        "7 gün sonra prosesi təkrarlayın",
      ],
    },
  },
  {
    id: "p-2",
    author: { name: "Aqronom Səbinə", region: "Quba", isExpert: true },
    timeAgo: "3 saat əvvəl",
    content:
      "Bu mövsüm alma bağlarında zərərvericilərə qarşı erkən proflaktika çox vacibdir. Aşağıdakı qrafikə əməl edin və yarpaq bitərkən ilk işləməni keçirin.",
    tags: ["#alma", "#proflaktika"],
    upvotes: 92, comments: 14,
  },
  {
    id: "p-3",
    author: { name: "Rəşad Quliyev", region: "Şəmkir", isExpert: false },
    timeAgo: "5 saat əvvəl",
    content:
      "Şəmkirin Çinarlı kəndində çəyirtkə sürüsü gördük. Sürətlə yayılır, qonşu fermerlər diqqətli olun!",
    tags: ["#çəyirtkə", "#xəbərdarlıq"],
    image: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&q=70",
    upvotes: 156, comments: 31,
  },
];

export const ACTIVE_SOS = {
  id: "sos-1",
  type: "Çəyirtkə hücumu",
  severity: "HIGH" as const,
  regions: ["Şəmkir", "Tovuz", "Gəncə"],
  description:
    "Son 6 saatda 8 fermer Şəmkir-Tovuz xətti üzrə çəyirtkə sürüləri bildirib. Dərhal qoruyucu tədbirlər görün.",
  createdAt: "2 saat əvvəl",
};
