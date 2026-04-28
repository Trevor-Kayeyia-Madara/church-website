export const SITE = {
  name: "Deliverance Church Utawala",
  shortName: "DC Utawala",
  tagline: "The Church of Choice",
  location: "Utawala, Nairobi, Kenya",
  logoUrl: "/logo.png",
  liveEmbedUrl: null,
  contact: {
    addressLine1: "Utawala, Nairobi, Kenya",
    addressLine2: "Utawala Road",
    phoneDisplay: "+254 700 000 000",
    phoneTel: "+254700000000",
    email: "info@deliveranceutawala.org",
  },
  social: {
    youtube: "https://www.youtube.com",
    facebook: "https://www.facebook.com/DeliveranceChurchUtawala",
    instagram: "https://www.instagram.com",
    tiktok: "https://www.tiktok.com/@utawaladeliverancechurch",
    linktree: "https://linktr.ee/dcutawala",
  },
  serviceTimes: [
    { day: "Sunday", time: "6:30 AM - 9:00 AM", label: "First Service" },
    { day: "Sunday", time: "9:30 AM - 12:00 PM", label: "Second Service" },
    { day: "Tuesday", time: "6:30 PM", label: "Fellowship" },
    { day: "Wednesday", time: "6:30 PM - 8:00 PM", label: "Anchored Service" },
    { day: "Friday", time: "6:30 PM - 8:00 PM", label: "Ignite Service" },
  ],
  microChurches: [
    { day: "Tuesday", time: "6:30 PM - 8:00 PM", label: "Micro Church" },
    { day: "Saturday", time: "2:00 PM - 4:00 PM", label: "Micro Church" },
    { day: "Sunday", time: "After First Service", label: "Micro Church" },
    { day: "Sunday", time: "After Second Service", label: "Micro Church" },
  ],
  sundaySchool: {
    day: "Sunday",
    time: "During both services",
    label: "Sunday School",
  },
  ministries: [
    {
      slug: "worship",
      title: "Worship Ministry",
      description: "Serve God with your gifts through worship and excellence.",
      highlights: ["Choir", "Band", "Media support"],
    },
    {
      slug: "house-of-prophets",
      title: "House of Prophets",
      description: "A discipleship space for spiritual growth and direction.",
      highlights: ["Teaching", "Mentorship", "Prayer"],
    },
    {
      slug: "daughters-of-faith",
      title: "Daughters of Faith",
      description: "Women’s fellowship for connection and strengthening.",
      highlights: ["Bible study", "Community", "Support"],
    },
    {
      slug: "young-adults",
      title: "Young Adults",
      description: "A community for young people to grow and serve together.",
      highlights: ["Fellowship", "Purpose", "Discipleship"],
    },
    {
      slug: "sunday-school",
      title: "Sunday School",
      description: "A safe, joyful space for children to grow in faith.",
      highlights: ["Bible stories", "Worship", "Care & safety"],
    },
    {
      slug: "media-team",
      title: "Media Team",
      description: "Serve behind the scenes to support worship and outreach.",
      highlights: ["Sound", "Video", "Design"],
    },
  ],
  school: {
    name: "Dominion Center Kids School",
    tagline:
      "Providing quality Christian education where children learn, grow, and discover their God-given potential in a nurturing environment.",
    heroTitle: "Dominion Center Kids School",
    heroSubtitle:
      "Providing quality Christian education where children learn, grow, and discover their God-given potential in a nurturing environment.",
    programs: [
      {
        key: "play-group",
        title: "Play Group",
        subtitle: "From Age 2",
        offers: [
          "Play-based Learning",
          "Christian Values",
          "Qualified Teachers",
          "Safe Environment",
        ],
      },
      {
        key: "pp1",
        title: "PP1",
        subtitle: "Intake Ongoing",
        offers: [
          "CBC Curriculum",
          "Small Class Sizes",
          "Extracurricular Activities",
          "Moral Education",
        ],
      },
    ],
    cta: {
      title: "Ready to Enroll Your Child?",
      body:
        "Join the Dominion Center family and give your child a foundation built on Christian values and academic excellence.",
      primaryLabel: "Apply Now",
      primaryHref: "/contact?subject=Dominion%20Center%20Admissions",
      secondaryLabel: "Schedule Visit",
      secondaryHref: "/contact?subject=Schedule%20a%20School%20Visit",
    },
  },
  giving: {
    title: "Giving & Donations",
    headline: "Generous Hearts",
    body:
      "Your generosity enables us to fulfill our mission and serve our community. Thank you for being a faithful steward of God's blessings.",
    types: [
      {
        key: "tithes",
        title: "Tithes",
        description:
          "Your regular tithe offering to support the church ministry and operations.",
        verse:
          '"Bring the whole tithe into the storehouse..." - Malachi 3:10',
      },
      {
        key: "offering",
        title: "Offerings",
        description:
          "These go a long way to support various church programs and activities.",
        verse:
          '"Each of you should give what you have decided in your heart to give..." - 2 Corinthians 9:7',
      },
    ],
    paymentMethods: [
      {
        key: "mpesa",
        title: "M-Pesa",
        lines: ["Paybill: 4043891", "Account: Your Name and Purpose"],
      },
    ],
  },
};
