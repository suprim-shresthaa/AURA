export const navLinks = [
  { label: "Home", path: "/" },
  { label: "Rent a Vehicle", path: "/vehicles" },
  { label: "Spare Parts", path: "/spare-parts" },
  // { label: "About Us", path: "/about" },
  // { label: "Contact", path: "/contact" },
];

export const heroContent = {
  title: "Rent a Vehicle or Find Spare Parts",
  subtitle:
    "Explore a wide selection of cars, motorbikes, scooters, and spare parts for your needs. Book online, verify, and pay securely.",
  backgroundImage:
    "/banner.png",
  actions: [
    { label: "Rent a Vehicle", variant: "primary", path: "/vehicles" },
    { label: "Rent Spare Parts", variant: "secondary", path: "/spare-parts" },
  ],
};

const sharedCardStyles = {
  ToyotaCamry:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDsyvuVRd8DuGQg4vaU_GOD2IwX3iiOQBCeTHiGGMIsBxifUvBNwHt39UxhoTRgMKVU0WooeHQYhjMd0c4korZw24OAlf0tYi1fQquM7NSC3DWjGfGoU8wWie-nDq4i-oFmJhiHI2JidJkE629aTJOVq_dJQrNswi4ZLblQ1--3mFiqbv4GMfV1HVNXaHijJYK2rrrL5k5bZQzOXr5kKxxZcwEKt5jj6PuLt2PRuQZQkvqOBGSItJR7qYOocwlDcfAfgJeSaeyOW7UT",
  FordExplorer:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCAYNxlgP8PlSoiiDIPStN_35-SQ-Qq6e8uK5jBZaYewONpMGfky-Gk01uyzqVt272EP_pk0giwr2ts0RHHkYWOXnWnU1tVCH1Hu97COmI7qIZXA7SgTScXnh2tHNmhf1Jjwblp1IoayPiJm3GxYGlmcbXwmLaXYE51I3R7CVacUC_TsybneLF7oSwBCUeOQm6Tt8F8FMTrEDiPAvaeBvPTXcgQTcUaKVk0sAboDIfChuQXm9J7ad_u-4SFAxJGlDWrlHHM3ybmR3-F",
  TeslaModel3:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBoaUmXU1U3gOGCMs-YkN0PyY1LuW4LW_p1z3qipx1Qk2D0OhiGZYSwrfm_8qkuspYKYimTCR9S06P1UHgOl7YejiimD5C73w0d4WZ6GAk4hYE6yg4y_-vVuUTzaBUgiPzAgP-ibMsmz-V7DDCZ_i78bfKVzP6Ku6cihoONvfv_wR_B00MXYXUa9_WI1tZdFotB4BB5nbf5mjbH3ICclFeOq8ZfTDwRYmmJXsmJgftnwQGITgKUj2Xm-lTgaQWPHPP6mLbqoi7rNx0L",
  YamahaXSR700:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBzCfn0L39Kz7W6RnlimliJ3zKn5xUkirkxuaPxgmoV5xG86VmL3F9Lw710jd_z-7ysUaf8PhT5_lohmfY9llSnLFLvgfjezBq6mTkjtVH_VlAXmA5guJQi6qxhCneMHpd_xP2SzBsxikIx4tfyMDYEheggbN7STnYSOzOojPV4pnHdE9XKQHw3zTGFq0V8d91A_kjKaEIbANe6Q6jPwn7u0ddkz5R_4YJ-Q4xtt4yN79B_a05ydCs8FL3NybuMnhHbjdBcqLFCqUgT",
  VespaPrimavera:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD9ecftyyJhQVixVk9TJvRXYJ3O_TcRbnqU3sVfwgQZk4eMnRGUHmbWxeWfe-0wKhnh3tn97gVT4EFCz-SEFCdKXp1vBTXn5ENhay6_kGBBXaw5d_mJDkVeA4YVqd1J0RCkaGBxWuFIKInQNTylqWo2XB6t3ucqRF_39iXQ4OtCpJDE2H3dHQiehrJNxTdjqIlgHn3FkPap8NDXOUM_332cgn0uONKRTQFl_91OvxaWFXMeReyVe_g1kUM3RcgkfoxKpq_W1acVRT-T",
  RoyalEnfield:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB-tq1SbsVWCm82WCuKVOJG_-Bpde9ZhdRWt-P7hel7SQe__moVYVp8fEk9XHs1Aq3uNxh2s9O2yXzZrquk_RJat9v2q1p862ywyXmsdcXrlz96NU8GaWyuHmXWc32NE9_YJ5mlgh16_1cuqBnR7_MEOo8IvuRc8WzAiDdUC7lolghWu60qjOGih3ysCflH6ebtdQUTUPFobwzmzuxoL026WY8H1-T52H_FPMKL4nW3TKiTIzMPYEWuLxt5YKo1kEbYZ26bucrvpolu",
  NIUNQi:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBTtYa3tjHj5sb8TaUeWQ9eAnf1a_R5Ib9OFCNQgv7k8nLGjUjeW1MUpVSmNG1toisyVxk7nRjAj82Jaadv2TOMKKozLEqAm7-nhBHKhL4SINaRvf4ZF1dhHBFjtTzhz9BDv8z2V6Ow7vKhCJyLDpdn9nHbbbjb9sBDlyGzqMHcrb4Suj2SK5rNN2w1oii8GpF57LjHseiPmVKyIm_3LtMz9Y9LYLv5ldeS_CXcixvqjT9U2r8bfSjMzSR33mm06ZWUg2_zUCaCRbfn",
  HondaPCX125:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAWTfh7mblkQ0S0rAF-clPKAvG9dFQBD7C5xNIIYG2E0pc9qgUi_pl26nAx57r9w63Nfb-1ZoXgxf5k-ViPpzNniCvx7LaoKhR_XNucjTj7FLvDCymo1-ldFp5ve7QaOAJE2lAy4JT9HBNr_GjQjNf6u0BK8My8GPQAulPgvZxtruRiwjioS_Z8i3ZzVJnJZtXux_BEqTT07PR0g5fPcvY-forjKV9-MQoFqme1a0gFO_ZfO6JzUBjRmOQBO1ZZ4QCZbANpsMF8j0Lo",
  YamahaTMAX:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC43lLqvKR-mZB4dv_4H9orQphw3NUR4q9YbZ9fjY4dAev92fyS-wrMN7y88Kq51DOGkUWXTepM_wxLEnm5lWpCoYRlrMqZ7cSdoYKJmyObiHz4tbx8Vk1s43rXSYxCAI0Bi-XCfEMqgR823gDm8B1I0TrPtixm8zobULqRjUhj-v5qnJp9RecJTqVJUk48sh7iaDCNJnHBVKKwSxy3nH0QHdzxht7xeJR50CmGVGNzL6M_ZsQrA19ig5gLgK0oE3sMZfctcldcGLKL",
  MichelinRoad5:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCHzrinYac2Nln27KDOPGCViD6bDhvL2AMDKhkDOkBPmb1kiXxCrFnPZvowN1swAccOZi7L5SAzubJnQxvoA-qBhs2O1qoFfCi4CzPE0k35Jntwu_LLo0QBkrC9nUfB_nt8WxPf65gpDjjFgwV1X44MqUw2q_WuBUPuKI34gQKBkYtnxFNIKcncMbNu63A5vBv8GFiaX-HjZwKsd8AjUbey69UQKbvED4JevXbe36v4CTu3Drkx4doz0JLjttjSHt_v5Deg8weDCgyL",
  ShoeiRFSR:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC_bZA16JMLMp6Vkng2s1yQ_tEFw6qYnUkZlqwkovDR4xScaxvdwBQXf3rWMC1XuJGzqy-64blUWa-YcYUolU0zw8t-AyZg7vMnajOwKUHwZckC-l37or_itgWv-1p2MjmnzmDiCqkjAc5MLRVRdXDxDTJsPpckIvq0rCL2vrHTgD9zfpsvdYpC6F5EifJ5Ky1hewSpSJFWSAo3yowzC7kb4NpQJRiT60gIy_tiLavgJJC2RzYSFFBJQewW8fX_9oS1KmoDFWl4VfQt",
  BremboPads:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAzFPOKYVXlo3HpC_cDTIEg4E8yWyenTNV3yAxcBqjYE2i0hcByL7x_7U7lgsiVIFo7oKT9NnXQoIEuVLP-ZsuZgnGdCEsKYOfqaSJurOKL5F5DrVqnYsuP3dYgAnda7gIJ64j26G9r5wuMHcSqfBoXK_y9bIR_my4GNC8gtJgG4IFEKMrlPLbXVjfYEnANKZhOL5cea2gBkTVChWMHuQox2GOyxhun-OP47gy8ajEE7C_LSWaDqSMs9rUxGHa8f-DvY0vHK2VGeg2o",
};

export const featuredCollections = [
  {
    id: "cars",
    title: "Rent Cars",
    items: [
      {
        name: "Toyota Camry",
        description: "A reliable and comfortable sedan for everyday use.",
        image: sharedCardStyles.ToyotaCamry,
      },
      {
        name: "Ford Explorer",
        description: "A spacious SUV for family trips and adventures.",
        image: sharedCardStyles.FordExplorer,
      },
      {
        name: "Tesla Model 3",
        description: "An electric car for eco-friendly driving.",
        image: sharedCardStyles.TeslaModel3,
      },
    ],
  },
  {
    id: "bikes",
    title: "Rent Bikes",
    items: [
      {
        name: "Yamaha XSR700",
        description: "A powerful and stylish motorbike for city and highway.",
        image: sharedCardStyles.YamahaXSR700,
      },
      {
        name: "Vespa Primavera",
        description: "A classic scooter for urban commuting.",
        image: sharedCardStyles.VespaPrimavera,
      },
      {
        name: "Royal Enfield Classic 350",
        description: "A vintage-inspired motorbike with a timeless design.",
        image: sharedCardStyles.RoyalEnfield,
      },
    ],
  },
  {
    id: "scooters",
    title: "Rent Scooters",
    items: [
      {
        name: "NIU NQi GT",
        description: "An electric scooter for efficient and eco-friendly city travel.",
        image: sharedCardStyles.NIUNQi,
      },
      {
        name: "Honda PCX125",
        description: "A practical and reliable scooter for daily commutes.",
        image: sharedCardStyles.HondaPCX125,
      },
      {
        name: "Yamaha TMAX",
        description: "A high-performance sport scooter for enthusiasts.",
        image: sharedCardStyles.YamahaTMAX,
      },
    ],
  },
  {
    id: "parts",
    title: "Rent Spare Parts",
    items: [
      {
        name: "Michelin Pilot Road 5",
        description: "High-performance tire for excellent grip and durability.",
        image: sharedCardStyles.MichelinRoad5,
      },
      {
        name: "Shoei RF-SR",
        description: "Premium helmet offering superior protection and comfort.",
        image: sharedCardStyles.ShoeiRFSR,
      },
      {
        name: "Brembo Sintered Brake Pads",
        description: "High-quality brake pads for reliable stopping power.",
        image: sharedCardStyles.BremboPads,
      },
    ],
  },
];

export const howItWorksSteps = [
  {
    title: "Search",
    description: "Find the perfect vehicle or spare part using our search filters.",
    icon: "search",
  },
  {
    title: "Book",
    description: "Select your dates and book your rental online.",
    icon: "calendar",
  },
  {
    title: "Pay",
    description: "Pay securely with various payment options.",
    icon: "credit-card",
  },
  {
    title: "Ride",
    description: "Pick up your vehicle or receive your spare parts and enjoy the ride.",
    icon: "car",
  },
];

export const testimonials = [
  {
    name: "Owen Bennett",
    date: "2 months ago",
    quote:
      "AURA made renting a vehicle so easy! The car was in excellent condition, and the process was seamless from start to finish. Highly recommended!",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7Y-uP1UefhGgDsV2womucd9Kg2xqzfPggqU4aVxt4Hj1WdjXjipDbJnucNeLn2X7RkjWO8qIYB8kKOp7CIPlvOm9rdhSNTAMp_YPigVTzMeVV2md8YYmh2BVZYyzNruqNZ6yW6vf-kv9-2yxA5U6zriGVMJ2qRDnXCfNOzodSyyyJ9Grv-oRFi0D1hIOh_H1-On7JIgDxLPtz57CLtuOwgxyTOv9xmiun7W1B1bKHjehwaE9sOaf1KbwStPa2RtsiPS9EcM7UOskd",
    rating: 5,
    likes: 12,
    dislikes: 2,
  },
  {
    name: "Chloe Foster",
    date: "3 months ago",
    quote:
      "I rented a scooter for a weekend trip, and it was perfect. The booking was straightforward, and the customer service was great. Will definitely use AURA again.",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB6fTa11lB2XDvKGOsUBSDd-96bZOo8fVs2_AJTaccmphs5dF852_TBcxqVZUev6LuJOIvK5xLR-Pod6mT0E1yTpD2CsBqQLQUnS9KB46P9EqsLWAKX7gyCdJSxAKndNTIH8G2mvHcOkysUFcHPNj05IURA42OviCWRVYzI05TRqP1_l5d8YsbD4E8iqG3ojUPM5U1huYUlehb_ogwC2SzP8OBjAxl4RrJDx7Ae0gCfXzjtmKUIK4YYVDo73qpQQ2sRkGxIC-p7s3Ew",
    rating: 4,
    likes: 8,
    dislikes: 1,
  },
  {
    name: "Lucas Reed",
    date: "4 months ago",
    quote:
      "I needed a spare part for my vehicle urgently, and AURA delivered it quickly. The part was genuine, and the price was fair. Thank you for the excellent service!",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuASUWTrE6KGmSYPNXiMjfqBUYcCadZ1wZY73NBnRJVHgwDrATh6RDmVCfAYF2cAJoDulGzaw8N28xYTu1WyMHLBqsds54YHRtAAicmHG1xJJfNRSLdy3ahNRiJkGQm-gvcxmmr09fDMkrjsfZe5rO2Ae3XtvpHPHMYKEz8Ur1y6mGy7pXFavKm6QaSclz6iPoNRUIk5gNa6zoGO8EWn2pOvdf3s1UR1hf3ywh-535eMxoPBSsywI7-urqUdQxASsToYTgUrONvPm2kh",
    rating: 5,
    likes: 15,
    dislikes: 3,
  },
];

export const footerLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Us", href: "#" },
];

export const socialLinks = [
  { label: "Twitter", href: "#", icon: "twitter" },
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "Facebook", href: "#", icon: "facebook" },
];

