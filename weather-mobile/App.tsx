import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface WeatherData {
  city: string;
  temperature: string;
  description: string;
  clothingAdvice: string;
  activityAdvice: string;
  healthAdvice: string;
  weatherCondition?: 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'stormy';
}

interface ClothingItem {
  emoji: string;
  name: string;
  description: string;
}

interface ActivityItem {
  emoji: string;
  name: string;
  description: string;
  location: 'indoor' | 'outdoor';
}

interface Plant {
  name: string;
  emoji: string;
  description: string;
  characteristics: string[];
  plantingTips: string;
}

interface Post {
  id: string;
  author: string;
  city: string;
  content: string;
  weather: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  userHasLiked: boolean;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface Place {
  name: string;
  emoji: string;
  description: string;
  type: 'outdoor' | 'indoor' | 'mixed';
  activities: string[];
}

// Yeni Renk Paleti - Beyaz, Turuncu, Mavi
const weatherColors = {
  sunny: {
    primary: ['#FF8C42', '#FFB366', '#FFD1A3'] as const,
    secondary: ['#FF9F59', '#FFA366'] as const,
    background: ['#F8FAFF', '#EFF6FF', '#DBEAFE'] as const,
    accent: '#FF8C42',
    textPrimary: '#1E3A8A',
    textSecondary: '#3B82F6'
  },
  rainy: {
    primary: ['#3B82F6', '#60A5FA', '#93C5FD'] as const,
    secondary: ['#2563EB', '#1D4ED8'] as const,
    background: ['#F0F9FF', '#E0F2FE', '#BAE6FD'] as const,
    accent: '#2563EB',
    textPrimary: '#1E3A8A',
    textSecondary: '#3B82F6'
  },
  cloudy: {
    primary: ['#E5E7EB', '#F3F4F6', '#F9FAFB'] as const,
    secondary: ['#D1D5DB', '#9CA3AF'] as const,
    background: ['#FFFFFF', '#F9FAFB', '#F3F4F6'] as const,
    accent: '#FF8C42',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280'
  },
  snowy: {
    primary: ['#FFFFFF', '#F8FAFF', '#EFF6FF'] as const,
    secondary: ['#DBEAFE', '#BFDBFE'] as const,
    background: ['#FFFFFF', '#F8FAFF', '#EFF6FF'] as const,
    accent: '#3B82F6',
    textPrimary: '#1E3A8A',
    textSecondary: '#3B82F6'
  },
  stormy: {
    primary: ['#374151', '#4B5563', '#6B7280'] as const,
    secondary: ['#9CA3AF', '#D1D5DB'] as const,
    background: ['#F9FAFB', '#F3F4F6', '#E5E7EB'] as const,
    accent: '#FF8C42',
    textPrimary: '#1F2937',
    textSecondary: '#4B5563'
  }
};

// Enhanced clothing recommendations
const clothingRecommendations = {
  hot: [
    { emoji: '👕', name: 'Hafif Tişört', description: 'Nefes alan pamuk kumaş' },
    { emoji: '🩳', name: 'Şort', description: 'Rahat kesim yazlık şort' },
    { emoji: '👡', name: 'Sandalet', description: 'Açık ayakkabı tercihi' },
    { emoji: '🕶️', name: 'Güneş Gözlüğü', description: 'UV korumalı' },
    { emoji: '🧴', name: 'Güneş Kremi', description: 'SPF 30+ koruma' }
  ],
  warm: [
    { emoji: '👔', name: 'Gömlek', description: 'İnce uzun kollu' },
    { emoji: '👖', name: 'Pantolon', description: 'Hafif kumaş' },
    { emoji: '👟', name: 'Spor Ayakkabı', description: 'Rahat günlük' },
    { emoji: '🧥', name: 'İnce Ceket', description: 'Akşam için' }
  ],
  mild: [
    { emoji: '🧥', name: 'Hırka', description: 'Orta kalınlık' },
    { emoji: '👖', name: 'Jean', description: 'Rahat kesim' },
    { emoji: '👟', name: 'Kapalı Ayakkabı', description: 'Nefes alan' },
    { emoji: '🧣', name: 'İnce Atkı', description: 'Akşam için' }
  ],
  cold: [
    { emoji: '🧥', name: 'Kalın Mont', description: 'Su geçirmez' },
    { emoji: '🧤', name: 'Eldiven', description: 'Sıcak tutan' },
    { emoji: '🧣', name: 'Atkı', description: 'Yün atkı' },
    { emoji: '👢', name: 'Bot', description: 'Su geçirmez bot' },
    { emoji: '🧢', name: 'Bere', description: 'Başı sıcak tutan' }
  ],
  freezing: [
    { emoji: '🧥', name: 'Kışlık Mont', description: 'Aşırı soğuk için' },
    { emoji: '🧤', name: 'Kalın Eldiven', description: 'Su geçirmez' },
    { emoji: '🧣', name: 'Kalın Atkı', description: 'Boynu koruyan' },
    { emoji: '🥾', name: 'Kışlık Bot', description: 'Kaymaz taban' },
    { emoji: '👂', name: 'Kulaklık', description: 'Kulak koruması' }
  ]
};

// Enhanced activity recommendations
const activityRecommendations = {
  sunny: [
    { emoji: '🏖️', name: 'Plaj Aktiviteleri', description: 'Güneşlenme, yüzme', location: 'outdoor' as const },
    { emoji: '🚴', name: 'Bisiklet Turu', description: 'Parkta gezinti', location: 'outdoor' as const },
    { emoji: '🧘', name: 'Yoga', description: 'Açık havada yoga', location: 'outdoor' as const },
    { emoji: '🏃', name: 'Koşu', description: 'Sabah koşusu', location: 'outdoor' as const }
  ],
  rainy: [
    { emoji: '📚', name: 'Kitap Okuma', description: 'Rahat köşede', location: 'indoor' as const },
    { emoji: '🎬', name: 'Film İzleme', description: 'Netflix zamanı', location: 'indoor' as const },
    { emoji: '🍳', name: 'Yemek Yapma', description: 'Yeni tarifler', location: 'indoor' as const },
    { emoji: '🎨', name: 'Sanat', description: 'Yaratıcı aktiviteler', location: 'indoor' as const }
  ],
  cloudy: [
    { emoji: '🚶', name: 'Yürüyüş', description: 'Park gezintisi', location: 'outdoor' as const },
    { emoji: '📸', name: 'Fotoğrafçılık', description: 'Şehir turu', location: 'outdoor' as const },
    { emoji: '☕', name: 'Kafe', description: 'Sıcak içecek', location: 'indoor' as const },
    { emoji: '🛍️', name: 'Alışveriş', description: 'AVM gezisi', location: 'indoor' as const }
  ],
  snowy: [
    { emoji: '⛷️', name: 'Kış Sporları', description: 'Kayak, snowboard', location: 'outdoor' as const },
    { emoji: '☃️', name: 'Kardan Adam', description: 'Aile aktivitesi', location: 'outdoor' as const },
    { emoji: '🔥', name: 'Şömine', description: 'Sıcak ortam', location: 'indoor' as const },
    { emoji: '🍲', name: 'Sıcak Çorba', description: 'Besleyici yemek', location: 'indoor' as const }
  ],
  stormy: [
    { emoji: '🏠', name: 'Evde Kal', description: 'Güvenli ortam', location: 'indoor' as const },
    { emoji: '🎲', name: 'Oyun', description: 'Masa oyunları', location: 'indoor' as const },
    { emoji: '📱', name: 'Dijital', description: 'Online aktiviteler', location: 'indoor' as const },
    { emoji: '🛏️', name: 'Dinlenme', description: 'Rahatlatıcı aktiviteler', location: 'indoor' as const }
  ]
};

// Bitki Önerileri Sıcaklık Bazlı - EMOJİLER DÜZELTİLDİ
const plantRecommendations = {
  hot: [
    {
      name: 'Domates',
      emoji: '🍅',
      description: 'Sıcak iklim sebzesi, yaz aylarında mükemmel verim.',
      characteristics: ['Güneş sever', 'Yüksek sıcaklığa dayanıklı', 'Bol su ister'],
      plantingTips: 'Günde 6-8 saat güneş alacak alanda yetiştirin.'
    },
    {
      name: 'Biber',
      emoji: '🌶️',
      description: 'Sıcak havayı seven, vitamin deposu sebze.',
      characteristics: ['Sıcaklık sever', 'Uzun verim dönemi', 'C vitamini zengini'],
      plantingTips: 'Toprak sıcaklığı 18°C üzerinde olmalı.'
    },
    {
      name: 'Patlıcan',
      emoji: '🍆',
      description: 'Yaz sebzesi, sıcak iklimde en iyi gelişir.',
      characteristics: ['Sıcaklık gereksinimi yüksek', 'Uzun meyveli', 'Antioxidan zengini'],
      plantingTips: 'Fide dikimi mayıs sonunda yapılmalı.'
    }
  ],
  warm: [
    {
      name: 'Salatalık',
      emoji: '🥒',
      description: 'Ilıman sıcaklıklarda mükemmel gelişen sebze.',
      characteristics: ['Hızlı büyüyen', 'Su oranı yüksek', 'Serinletici etkisi'],
      plantingTips: 'Nemli toprakta, yarı gölgede yetiştirebilirsiniz.'
    },
    {
      name: 'Kabak',
      emoji: '🎃',
      description: 'Ilıman iklimde bol verimli, vitamin deposu.',
      characteristics: ['Geniş yapraklı', 'Hızlı gelişim', 'Çok amaçlı kullanım'],
      plantingTips: 'Geniş alan bırakarak dikin, yan dallar çıkarır.'
    }
  ],
  mild: [
    {
      name: 'Marul',
      emoji: '🥬',
      description: 'Serin havalarda en iyi gelişen yapraklı sebze.',
      characteristics: ['Serin sever', 'Hızlı hasat', 'Vitamin A zengini'],
      plantingTips: 'İlkbahar ve sonbaharda ekimi ideal.'
    },
    {
      name: 'Ispanak',
      emoji: '🌿',
      description: 'Soğuk dayanıklı, demir deposu yapraklı sebze.',
      characteristics: ['Soğuğa dayanıklı', 'Demir zengini', 'Hızlı büyüyen'],
      plantingTips: 'Kış aylarında sera koşullarında yetiştirilebilir.'
    }
  ],
  cold: [
    {
      name: 'Lahana',
      emoji: '🥬',
      description: 'Soğuk iklime en uygun sebze, kış deposu.',
      characteristics: ['Donlara dayanıklı', 'Uzun saklama', 'C vitamini bomba'],
      plantingTips: 'Sonbahar ekimi, kış hasadı ideal.'
    },
    {
      name: 'Havuç',
      emoji: '🥕',
      description: 'Soğuk topraklarda daha tatlı gelişen kök sebze.',
      characteristics: ['Soğuk sever', 'Beta karoten zengini', 'Uzun saklanır'],
      plantingTips: 'Derin toprakta, taşsız alanda yetiştirin.'
    }
  ],
  freezing: [
    {
      name: 'Soğan',
      emoji: '🧅',
      description: 'En soğuk koşullarda bile dayanabilen temel sebze.',
      characteristics: ['Aşırı soğuğa dayanıklı', 'Antibakteriyel', 'Uzun saklama'],
      plantingTips: 'Sonbahar dikimi, ilkbaharda hasat.'
    },
    {
      name: 'Sarımsak',
      emoji: '🧄',
      description: 'Donlu topraklarda bile gelişebilen şifalı bitki.',
      characteristics: ['Don dayanıklı', 'Antiviral özellik', 'Doğal antibiyotik'],
      plantingTips: 'Kasım ayında dikilir, temmuzda hasat edilir.'
    }
  ]
};

// Hava Durumuna Göre Gidilecek Yerler
const placeRecommendations = {
  sunny: [
    {
      name: 'Emirgan Korusu',
      emoji: '🌳',
      description: 'Güneşli günlerde piknik ve yürüyüş için ideal park.',
      type: 'outdoor' as const,
      activities: ['Piknik', 'Yürüyüş', 'Fotoğraf çekimi', 'Çiçek seyretme']
    },
    {
      name: 'Boğaz Turu',
      emoji: '⛵',
      description: 'Güneşli havada Boğazın tadını çıkarın.',
      type: 'outdoor' as const,
      activities: ['Tekne turu', 'Manzara izleme', 'Deniz kenarında yürüyüş']
    },
    {
      name: 'Çamlıca Tepesi',
      emoji: '🏔️',
      description: 'Şehrin panoramik manzarası için mükemmel.',
      type: 'outdoor' as const,
      activities: ['Manzara seyretme', 'Çay içme', 'Sunset izleme']
    }
  ],
  rainy: [
    {
      name: 'İstanbul Modern',
      emoji: '🎨',
      description: 'Yağmurlu günlerde sanat ve kültür için ideal.',
      type: 'indoor' as const,
      activities: ['Sanat eserleri izleme', 'Workshop', 'Kafe']
    },
    {
      name: 'Kanyon AVM',
      emoji: '🛍️',
      description: 'Alışveriş ve eğlence merkezi.',
      type: 'indoor' as const,
      activities: ['Alışveriş', 'Sinema', 'Yemek', 'Kafe']
    },
    {
      name: 'Rahmi Koç Müzesi',
      emoji: '🚗',
      description: 'Teknoloji ve tarih meraklıları için.',
      type: 'mixed' as const,
      activities: ['Müze gezisi', 'Interaktif deneyimler', 'Kafe']
    }
  ],
  cloudy: [
    {
      name: 'Galata Kulesi',
      emoji: '🗼',
      description: 'Bulutlu havada şehir manzarası için güzel.',
      type: 'mixed' as const,
      activities: ['Şehir manzarası', 'Fotoğraf', 'Çevre gezisi']
    },
    {
      name: 'Sultanahmet',
      emoji: '🕌',
      description: 'Tarihi yarımada keşfi için ideal hava.',
      type: 'mixed' as const,
      activities: ['Tarihi yerler', 'Müze', 'Yürüyüş', 'Alışveriş']
    },
    {
      name: 'Pierre Loti',
      emoji: '☕',
      description: 'Çay ve kahve keyfi için mükemmel.',
      type: 'outdoor' as const,
      activities: ['Çay içme', 'Manzara', 'Teleferik']
    }
  ],
  snowy: [
    {
      name: 'Belgrad Ormanı',
      emoji: '❄️',
      description: 'Kar manzarası eşliğinde doğa yürüyüşü.',
      type: 'outdoor' as const,
      activities: ['Kar yürüyüşü', 'Fotoğraf', 'Sıcak içecek']
    },
    {
      name: 'Beylerbeyi Sarayı',
      emoji: '🏰',
      description: 'Kar altında tarihi saray gezisi.',
      type: 'mixed' as const,
      activities: ['Saray turu', 'Tarihi keşif', 'Kafe']
    }
  ],
  stormy: [
    {
      name: 'Aqua Florya',
      emoji: '🐠',
      description: 'Fırtınalı havada kapalı alan aktivitesi.',
      type: 'indoor' as const,
      activities: ['Akvaryum gezisi', 'Su altı tüneli', 'Eğitici programlar']
    },
    {
      name: 'Cevahir AVM',
      emoji: '🏢',
      description: 'Kapalı alan eğlence merkezi.',
      type: 'indoor' as const,
      activities: ['Alışveriş', 'Sinema', 'Oyun alanları', 'Yemek']
    }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('weather');
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [temperatureUnit, setTemperatureUnit] = useState('C');
  const [language, setLanguage] = useState('TR');

  // Community state
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Agriculture default data - Istanbul weather
  const [agricultureData, setAgricultureData] = useState<WeatherData | null>(null);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];

  const quickCities = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana'];

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Tarım için İstanbul'un hava durumunu al
    getAgricultureWeather();
    
    // Demo posts oluştur
    initializeDemoPosts();
  }, []);

  const getAgricultureWeather = () => {
    const mockIstanbulWeather = {
      city: 'İstanbul',
      temperature: '22°C',
      description: 'Güneşli',
      clothingAdvice: 'Hafif kıyafetler giyin',
      activityAdvice: 'Açık hava aktiviteleri ideal',
      healthAdvice: 'Bol su için ve güneş kremini unutmayın',
      weatherCondition: getWeatherCondition('22°C', 'Güneşli')
    };
    setAgricultureData(mockIstanbulWeather);
  };

  const initializeDemoPosts = () => {
    const demoPosts: Post[] = [
      {
        id: '1',
        author: 'Ahmet Yılmaz',
        city: 'İstanbul',
        content: 'Bugün harika bir güneşli gün! Boğaz kenarında yürüyüş yapmanın tadını çıkarıyorum. ☀️',
        weather: '22°C Güneşli',
        timestamp: '2 saat önce',
        likes: 15,
        comments: [
          { id: '1', author: 'Ayşe K.', content: 'Çok güzel! Ben de çıkacağım.', timestamp: '1 saat önce' }
        ],
        userHasLiked: false
      },
      {
        id: '2',
        author: 'Zeynep Demir',
        city: 'İstanbul',
        content: 'Sabah servisi yağmur nedeniyle gecikmeli, şemsiyenizi unutmayın! 🌧️',
        weather: '18°C Yağmurlu',
        timestamp: '4 saat önce',
        likes: 8,
        comments: [],
        userHasLiked: false
      }
    ];
    setPosts(demoPosts);
  };

  // Determine weather condition based on temperature and description
  const getWeatherCondition = (temp: string, description: string): 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'stormy' => {
    const temperature = parseFloat(temp.replace('°C', ''));
    const desc = description.toLowerCase();
    
    if (desc.includes('kar') || desc.includes('snow') || temperature < 0) return 'snowy';
    if (desc.includes('yağmur') || desc.includes('rain') || desc.includes('storm')) return 'stormy';
    if (desc.includes('bulut') || desc.includes('cloud')) return 'cloudy';
    if (temperature > 25 && (desc.includes('güneş') || desc.includes('sunny') || desc.includes('clear'))) return 'sunny';
    if (desc.includes('fırtına') || desc.includes('thunder')) return 'stormy';
    
    return temperature > 20 ? 'sunny' : 'cloudy';
  };

  // Get clothing recommendations based on temperature
  const getClothingForTemperature = (temp: string): ClothingItem[] => {
    const temperature = parseFloat(temp.replace('°C', ''));
    
    if (temperature > 30) return clothingRecommendations.hot;
    if (temperature > 20) return clothingRecommendations.warm;
    if (temperature > 10) return clothingRecommendations.mild;
    if (temperature > 0) return clothingRecommendations.cold;
    return clothingRecommendations.freezing;
  };

  // Get activity recommendations based on weather condition
  const getActivitiesForWeather = (condition: string): ActivityItem[] => {
    return activityRecommendations[condition as keyof typeof activityRecommendations] || activityRecommendations.cloudy;
  };

  // Get plant recommendations based on temperature
  const getPlantsForTemperature = (temp: string): Plant[] => {
    const temperature = parseFloat(temp.replace('°C', ''));
    
    if (temperature > 30) return plantRecommendations.hot;
    if (temperature > 20) return plantRecommendations.warm;
    if (temperature > 10) return plantRecommendations.mild;
    if (temperature > 0) return plantRecommendations.cold;
    return plantRecommendations.freezing;
  };

  // Get place recommendations based on weather condition
  const getPlacesForWeather = (condition: string): Place[] => {
    return placeRecommendations[condition as keyof typeof placeRecommendations] || placeRecommendations.cloudy;
  };

  // Community functions
  const createPost = () => {
    if (!newPostContent.trim()) {
      Alert.alert('Hata', 'Lütfen gönderi içeriği girin');
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      author: 'Sen',
      city: weatherData?.city || 'İstanbul',
      content: newPostContent,
      weather: weatherData ? `${weatherData.temperature} ${weatherData.description}` : '22°C Güneşli',
      timestamp: 'Az önce',
      likes: 0,
      comments: [],
      userHasLiked: false
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    Alert.alert('Başarılı', 'Gönderiniz paylaşıldı!');
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.userHasLiked ? post.likes - 1 : post.likes + 1,
          userHasLiked: !post.userHasLiked
        };
      }
      return post;
    }));
  };

  const addComment = (postId: string) => {
    if (!newCommentContent.trim()) {
      Alert.alert('Hata', 'Lütfen yorum içeriği girin');
      return;
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'Sen',
      content: newCommentContent,
      timestamp: 'Az önce'
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));

    setNewCommentContent('');
    setSelectedPostId(null);
    Alert.alert('Başarılı', 'Yorumunuz eklendi!');
  };

  const getWeather = async (searchCity?: string) => {
    const targetCity = searchCity || city.trim();

    if (!targetCity) {
      Alert.alert('Hata', 'Lütfen bir şehir adı girin');
      return;
    }

    setLoading(true);

    try {
      // Simulated weather data for demo
      const mockResponse = `{
        "city": "${targetCity}",
        "temperature": "${Math.floor(Math.random() * 30 + 5)}°C",
        "description": "Güneşli",
        "clothingAdvice": "Hafif kıyafetler giyin",
        "activityAdvice": "Açık hava aktiviteleri ideal",
        "healthAdvice": "Bol su için ve güneş kremini unutmayın"
      }`;

      const parsedData = parseWeatherResponse(mockResponse, targetCity);
      setWeatherData(parsedData);
      setCity('');

      // Trigger animation when weather data loads
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      Alert.alert('Hata', 'Hava durumu bilgisi alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const parseWeatherResponse = (response: string, cityName: string) => {
    const data = JSON.parse(response);
    const weatherCondition = getWeatherCondition(data.temperature, data.description);
    
    return {
      city: cityName,
      temperature: data.temperature,
      description: data.description,
      clothingAdvice: data.clothingAdvice,
      activityAdvice: data.activityAdvice,
      healthAdvice: data.healthAdvice,
      weatherCondition
    };
  };

  const addToFavorites = () => {
    if (weatherData && !favorites.includes(weatherData.city)) {
      setFavorites([...favorites, weatherData.city]);
      Alert.alert('Başarılı', `${weatherData.city} favorilere eklendi!`);
    }
  };

  const removeFromFavorites = (cityToRemove: string) => {
    setFavorites(favorites.filter(city => city !== cityToRemove));
    Alert.alert('Bilgi', `${cityToRemove} favorilerden çıkarıldı`);
  };

  const quickSearch = (cityName: string) => {
    setCity(cityName);
    getWeather(cityName);
  };

  const getAgricultureAdvice = (cityName: string) => {
    setCity(cityName);
    getWeather(cityName);
  };

  const getPlantingAdvice = (temperature: string) => {
    const temp = parseFloat(temperature.replace('°C', ''));
    if (temp < 5) {
      return 'Soğuk hava nedeniyle ekim yapılmamalı. Sera koşulları tercih edilmeli. Kış sebzeleri için uygun dönem.';
    } else if (temp >= 5 && temp < 15) {
      return 'Soğuğa dayanıklı bitkiler ekilebilir. Buğday, arpa, nohut ekimi için ideal. Toprak hazırlığı yapılabilir.';
    } else if (temp >= 15 && temp < 25) {
      return 'Çoğu bitki için ideal ekim sıcaklığı. Mısır, ayçiçeği, pamuk ekimi yapılabilir. Sebze fidesi dikimi uygun.';
    } else if (temp >= 25 && temp < 35) {
      return 'Sıcak mevsim bitkileri için uygun. Susam, soya fasulyesi ekimi ideal. Erken sabah ekim tercih edilmeli.';
    } else {
      return 'Çok sıcak hava. Ekim işlemleri erken sabah veya akşam yapılmalı. Gölgeleme önlemleri alınmalı.';
    }
  };

  const getIrrigationAdvice = (temperature: string) => {
    const temp = parseFloat(temperature.replace('°C', ''));
    if (temp < 10) {
      return 'Sulama ihtiyacı az. Toprak nemini kontrol edin. Aşırı sulama kök çürümesine neden olabilir.';
    } else if (temp >= 10 && temp < 20) {
      return 'Orta düzeyde sulama. Haftada 2-3 kez sulama yeterli. Toprak yüzeyinin kurumasını bekleyin.';
    } else if (temp >= 20 && temp < 30) {
      return 'Düzenli sulama gerekli. Günde bir kez, sabah erken saatlerde sulama yapın. Damla sulama tercih edilmeli.';
    } else {
      return 'Yoğun sulama gerekli. Günde 2 kez (sabah-akşam) sulama. Mulçlama ile nem kaybını azaltın.';
    }
  };

  const getFieldWorkAdvice = (temperature: string) => {
    const temp = parseFloat(temperature.replace('°C', ''));
    if (temp < 0) {
      return 'Tarla işleri yapılamaz. Donlu toprakta çalışmak zararlı. Ekipman bakımı yapılabilir.';
    } else if (temp >= 0 && temp < 15) {
      return 'Toprak işleme için uygun. Pulluk, diskaro çalışmaları yapılabilir. Gübre dağıtımı ideal dönem.';
    } else if (temp >= 15 && temp < 30) {
      return 'Tüm tarla işleri için ideal sıcaklık. Ekim, dikim, ilaçlama yapılabilir. Hasat zamanı kontrol edilmeli.';
    } else {
      return 'Sıcak hava. Tarla işleri erken sabah (06:00-10:00) veya akşam (17:00-19:00) yapılmalı.';
    }
  };

  const renderWeatherTab = () => {
    const currentColors = weatherData?.weatherCondition ? weatherColors[weatherData.weatherCondition] : weatherColors.cloudy;
    
    return (
      <ExpoLinearGradient
        colors={currentColors.background}
        style={styles.gradientBackground}
      >
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Search Section */}
            <View style={[styles.glassCard, styles.searchSection]}>
              <TextInput
                style={styles.modernInput}
                placeholder="🏙️ Şehir adı girin..."
                placeholderTextColor="rgba(100,100,100,0.7)"
                value={city}
                onChangeText={setCity}
                onSubmitEditing={() => getWeather()}
              />

              <TouchableOpacity
                style={[styles.modernButton, { backgroundColor: currentColors.accent }]}
                onPress={() => getWeather()}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modernButtonText}>🔍 Hava Durumu</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Quick Cities */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickCitiesContainer}>
              {quickCities.map((quickCity, index) => (
                <TouchableOpacity
                  key={quickCity}
                  style={[styles.glassCard, styles.quickCityCard]}
                  onPress={() => quickSearch(quickCity)}
                >
                  <Text style={styles.quickCityEmoji}>📍</Text>
                  <Text style={[styles.quickCityName, { color: currentColors.textPrimary }]}>{quickCity}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {weatherData && (
              <>
                {/* Main Weather Card */}
                <View style={[styles.glassCard, styles.mainWeatherCard]}>
                  <ExpoLinearGradient
                    colors={currentColors.primary}
                    style={styles.temperatureGradient}
                  >
                    <View style={styles.weatherHeader}>
                      <View style={styles.weatherMainInfo}>
                        <Text style={[styles.modernCityName, { color: currentColors.textPrimary }]}>{weatherData.city}</Text>
                        <Text style={[styles.modernTemperature, { color: currentColors.textPrimary }]}>{weatherData.temperature}</Text>
                        <Text style={[styles.modernDescription, { color: currentColors.textSecondary }]}>{weatherData.description}</Text>
                      </View>
                      <TouchableOpacity style={styles.modernFavoriteButton} onPress={addToFavorites}>
                        <Text style={[styles.favoriteIcon, { color: currentColors.textPrimary }]}>⭐</Text>
                      </TouchableOpacity>
                    </View>
                  </ExpoLinearGradient>
                </View>

                {/* Enhanced Clothing Recommendations */}
                <View style={[styles.glassCard, styles.recommendationCard]}>
                  <Text style={[styles.modernSectionTitle, { color: currentColors.textPrimary }]}>👔 Kıyafet Önerileri</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsContainer}>
                    {getClothingForTemperature(weatherData.temperature).map((item, index) => (
                      <View key={index} style={[styles.recommendationItem, { borderColor: currentColors.accent + '30' }]}>
                        <Text style={styles.itemEmoji}>{item.emoji}</Text>
                        <Text style={[styles.itemName, { color: currentColors.textPrimary }]}>{item.name}</Text>
                        <Text style={[styles.itemDescription, { color: currentColors.textSecondary }]}>{item.description}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Enhanced Activity Recommendations */}
                <View style={[styles.glassCard, styles.recommendationCard]}>
                  <Text style={[styles.modernSectionTitle, { color: currentColors.textPrimary }]}>🎯 Aktivite Önerileri</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsContainer}>
                    {getActivitiesForWeather(weatherData.weatherCondition || 'cloudy').map((item, index) => (
                      <View key={index} style={[styles.recommendationItem, {
                        borderColor: item.location === 'outdoor' ? currentColors.accent + '50' : currentColors.textSecondary + '30'
                      }]}>
                        <Text style={styles.itemEmoji}>{item.emoji}</Text>
                        <Text style={[styles.itemName, { color: currentColors.textPrimary }]}>{item.name}</Text>
                        <Text style={[styles.itemDescription, { color: currentColors.textSecondary }]}>{item.description}</Text>
                        <Text style={[styles.locationTag, { color: currentColors.textSecondary }]}>
                          {item.location === 'outdoor' ? '🌍 Açık Alan' : '🏠 İç Mekan'}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Health Advice */}
                <View style={[styles.glassCard, styles.healthCard]}>
                  <Text style={[styles.modernSectionTitle, { color: currentColors.textPrimary }]}>💊 Sağlık Tavsiyeleri</Text>
                  <View style={styles.healthAdviceContainer}>
                    <Text style={[styles.healthAdviceText, { color: currentColors.textPrimary }]}>{weatherData.healthAdvice}</Text>
                    <View style={styles.healthTips}>
                      <Text style={[styles.healthTip, { color: currentColors.textSecondary, borderColor: currentColors.accent + '30' }]}>💧 Bol su için</Text>
                      <Text style={[styles.healthTip, { color: currentColors.textSecondary, borderColor: currentColors.accent + '30' }]}>🧴 Güneşten korunun</Text>
                      <Text style={[styles.healthTip, { color: currentColors.textSecondary, borderColor: currentColors.accent + '30' }]}>🏃 Aktif kalın</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {!weatherData && !loading && (
              <View style={[styles.glassCard, styles.welcomeCard]}>
                <Text style={styles.welcomeEmoji}>🌤️</Text>
                <Text style={[styles.welcomeTitle, { color: weatherColors.cloudy.textPrimary }]}>Hava Durumu Asistanı</Text>
                <Text style={[styles.welcomeDescription, { color: weatherColors.cloudy.textSecondary }]}>
                  Şehrinizi seçin ve güncel hava durumu bilgileriyle birlikte 
                  kıyafet ve aktivite önerilerini alın.
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </ExpoLinearGradient>
    );
  };

  const renderCommunityTab = () => {
    const currentColors = weatherColors.cloudy;
    
    return (
      <ExpoLinearGradient
        colors={currentColors.background}
        style={styles.gradientBackground}
      >
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={[styles.glassCard, styles.communityHeader]}>
            <Text style={[styles.modernSectionTitle, { color: currentColors.textPrimary }]}>💬 Community</Text>
            <Text style={[styles.communitySubtitle, { color: currentColors.textSecondary }]}>
              Bugünün hava durumunu paylaş, deneyimlerini anlat
            </Text>
          </View>

          {/* Create Post */}
          <View style={[styles.glassCard, styles.createPostCard]}>
            <TextInput
              style={[styles.postInput, { color: currentColors.textPrimary, borderColor: currentColors.accent + '30' }]}
              placeholder="Bugünkü hava durumu nasıl? Deneyimini paylaş..."
              placeholderTextColor={currentColors.textSecondary}
              multiline
              numberOfLines={3}
              value={newPostContent}
              onChangeText={setNewPostContent}
            />
            <TouchableOpacity
              style={[styles.postButton, { backgroundColor: currentColors.accent }]}
              onPress={createPost}
            >
              <Text style={styles.postButtonText}>📤 Paylaş</Text>
            </TouchableOpacity>
          </View>

          {/* Posts */}
          {posts.map((post) => (
            <View key={post.id} style={[styles.glassCard, styles.postCard]}>
              <View style={styles.postHeader}>
                <View>
                  <Text style={[styles.postAuthor, { color: currentColors.textPrimary }]}>{post.author}</Text>
                  <Text style={[styles.postLocation, { color: currentColors.textSecondary }]}>📍 {post.city} • {post.weather}</Text>
                </View>
                <Text style={[styles.postTime, { color: currentColors.textSecondary }]}>{post.timestamp}</Text>
              </View>
              
              <Text style={[styles.postContent, { color: currentColors.textPrimary }]}>{post.content}</Text>
              
              <View style={styles.postActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => toggleLike(post.id)}
                >
                  <Text style={[styles.actionText, { color: post.userHasLiked ? currentColors.accent : currentColors.textSecondary }]}>
                    {post.userHasLiked ? '❤️' : '🤍'} {post.likes}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setSelectedPostId(selectedPostId === post.id ? null : post.id)}
                >
                  <Text style={[styles.actionText, { color: currentColors.textSecondary }]}>
                    💬 {post.comments.length}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Comments */}
              {post.comments.length > 0 && (
                <View style={styles.commentsSection}>
                  {post.comments.map((comment) => (
                    <View key={comment.id} style={[styles.commentCard, { borderColor: currentColors.accent + '20' }]}>
                      <Text style={[styles.commentAuthor, { color: currentColors.textPrimary }]}>{comment.author}</Text>
                      <Text style={[styles.commentContent, { color: currentColors.textSecondary }]}>{comment.content}</Text>
                      <Text style={[styles.commentTime, { color: currentColors.textSecondary }]}>{comment.timestamp}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Comment Input */}
              {selectedPostId === post.id && (
                <View style={styles.commentInputSection}>
                  <TextInput
                    style={[styles.commentInput, { color: currentColors.textPrimary, borderColor: currentColors.accent + '30' }]}
                    placeholder="Yorumunu yaz..."
                    placeholderTextColor={currentColors.textSecondary}
                    value={newCommentContent}
                    onChangeText={setNewCommentContent}
                  />
                  <TouchableOpacity
                    style={[styles.commentButton, { backgroundColor: currentColors.accent }]}
                    onPress={() => addComment(post.id)}
                  >
                    <Text style={styles.commentButtonText}>➤</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </ExpoLinearGradient>
    );
  };

  const renderPlacesTab = () => {
    const currentColors = weatherData?.weatherCondition ? weatherColors[weatherData.weatherCondition] : weatherColors.cloudy;
    
    return (
      <ExpoLinearGradient
        colors={currentColors.background}
        style={styles.gradientBackground}
      >
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.placesHeader}>
            <Text style={[styles.modernSectionTitle, { color: currentColors.textPrimary }]}>📍 Gidilecek Yerler</Text>
            <Text style={[styles.placesSubtitle, { color: currentColors.textSecondary }]}>
              {weatherData ? `${weatherData.city} için hava durumuna uygun yerler` : 'Hava durumu bilgisi için şehir seçin'}
            </Text>
          </View>

          {weatherData ? (
            <>
              {/* Current Weather Display */}
              <View style={styles.placesWeatherCard}>
                <ExpoLinearGradient
                  colors={currentColors.primary}
                  style={styles.placesWeatherGradient}
                >
                  <Text style={[styles.placesWeatherText, { color: currentColors.textPrimary }]}>
                    {weatherData.temperature} {weatherData.description}
                  </Text>
                  <Text style={[styles.placesWeatherCity, { color: currentColors.textSecondary }]}>
                    📍 {weatherData.city}
                  </Text>
                </ExpoLinearGradient>
              </View>

              {/* Place Recommendations */}
              <Text style={[styles.modernSectionTitle, { color: currentColors.textPrimary }]}>🎯 Önerilen Yerler</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsContainer}>
                {getPlacesForWeather(weatherData.weatherCondition || 'cloudy').map((place, index) => (
                  <View key={index} style={styles.placeCard}>
                    <Text style={styles.placeEmoji}>{place.emoji}</Text>
                    <Text style={[styles.placeName, { color: currentColors.textPrimary }]}>{place.name}</Text>
                    <Text style={[styles.placeDescription, { color: currentColors.textSecondary }]}>{place.description}</Text>
                    
                    <Text style={[styles.placeType, { 
                      color: currentColors.textSecondary,
                      backgroundColor: place.type === 'outdoor' ? currentColors.accent + '20' : 
                                       place.type === 'indoor' ? currentColors.textSecondary + '20' : 
                                       currentColors.textPrimary + '20'
                    }]}>
                      {place.type === 'outdoor' ? '🌍 Açık Alan' : 
                       place.type === 'indoor' ? '🏠 Kapalı Alan' : '🌎 Karma'}
                    </Text>
                    
                    <View style={styles.placeActivities}>
                      <Text style={[styles.activitiesTitle, { color: currentColors.textPrimary }]}>Aktiviteler:</Text>
                      {place.activities.map((activity, actIndex) => (
                        <Text key={actIndex} style={[styles.activityItem, { color: currentColors.textSecondary }]}>
                          • {activity}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Additional Istanbul Recommendations */}
              <Text style={[styles.modernSectionTitle, { color: currentColors.textPrimary, marginTop: 32 }]}>🌟 İstanbul Favorileri</Text>
              
              <View style={styles.favoritePlaces}>
                <View style={styles.favoritePlaceItem}>
                  <Text style={styles.favoritePlaceEmoji}>🌉</Text>
                  <View style={styles.favoritePlaceInfo}>
                    <Text style={[styles.favoritePlaceName, { color: currentColors.textPrimary }]}>Boğaziçi Köprüsü</Text>
                    <Text style={[styles.favoritePlaceDesc, { color: currentColors.textSecondary }]}>Her havada güzel manzara</Text>
                  </View>
                </View>
                
                <View style={styles.favoritePlaceItem}>
                  <Text style={styles.favoritePlaceEmoji}>🕌</Text>
                  <View style={styles.favoritePlaceInfo}>
                    <Text style={[styles.favoritePlaceName, { color: currentColors.textPrimary }]}>Ayasofya Camii</Text>
                    <Text style={[styles.favoritePlaceDesc, { color: currentColors.textSecondary }]}>Tarihi mimari harikası</Text>
                  </View>
                </View>
                
                <View style={styles.favoritePlaceItem}>
                  <Text style={styles.favoritePlaceEmoji}>🏰</Text>
                  <View style={styles.favoritePlaceInfo}>
                    <Text style={[styles.favoritePlaceName, { color: currentColors.textPrimary }]}>Topkapı Sarayı</Text>
                    <Text style={[styles.favoritePlaceDesc, { color: currentColors.textSecondary }]}>Osmanlı tarihine yolculuk</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.placesPlaceholder}>
              <Text style={styles.placeholderEmoji}>🗺️</Text>
              <Text style={[styles.placeholderTitle, { color: currentColors.textPrimary }]}>Yer önerileri için hava durumu gerekli</Text>
              <Text style={[styles.placeholderText, { color: currentColors.textSecondary }]}>
                Hava durumu sekmesinden şehrinizi seçin ve o havaya uygun en iyi yerleri keşfedin.
              </Text>
            </View>
          )}
        </ScrollView>
      </ExpoLinearGradient>
    );
  };

  const renderFavoritesTab = () => (
    <ExpoLinearGradient
      colors={weatherColors.cloudy.background}
      style={styles.gradientBackground}
    >
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.glassCard, styles.favoritesHeader]}>
          <Text style={[styles.modernSectionTitle, { color: weatherColors.cloudy.textPrimary }]}>⭐ Favori Şehirlerim</Text>
          <Text style={[styles.favoritesSubtitle, { color: weatherColors.cloudy.textSecondary }]}>
            {favorites.length === 0 ? 'Henüz favori şehir eklenmemiş' : `${favorites.length} şehir`}
          </Text>
        </View>

        {favorites.length === 0 ? (
          <View style={[styles.glassCard, styles.emptyFavorites]}>
            <Text style={styles.emptyFavoritesEmoji}>📍</Text>
            <Text style={[styles.emptyFavoritesTitle, { color: weatherColors.cloudy.textPrimary }]}>Favori şehir yok</Text>
            <Text style={[styles.emptyFavoritesText, { color: weatherColors.cloudy.textSecondary }]}>
              Hava durumu sekmesinden şehir arayıp ⭐ butonuna basarak favori ekleyebilirsiniz.
            </Text>
          </View>
        ) : (
          <View style={styles.favoritesGrid}>
            {favorites.map((favCity, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.glassCard, styles.favoriteCard]}
                onPress={() => quickSearch(favCity)}
              >
                <Text style={[styles.favoriteCityName, { color: weatherColors.cloudy.textPrimary }]}>{favCity}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromFavorites(favCity)}
                >
                  <Text style={styles.removeButtonText}>❌</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ExpoLinearGradient>
  );

  const renderAgricultureTab = () => {
    const currentColors = weatherColors.sunny;
    
    return (
      <ExpoLinearGradient
        colors={currentColors.background}
        style={styles.gradientBackground}
      >
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.glassCard, styles.agricultureHeader]}>
            <Text style={[styles.modernSectionTitle, { color: currentColors.textPrimary }]}>🌱 Tarım Rehberi</Text>
            <Text style={[styles.agricultureSubtitle, { color: currentColors.textSecondary }]}>
              İstanbul'un güncel hava durumuna göre tarım tavsiyeleri
            </Text>
          </View>

          {agricultureData && (
            <>
              {/* Current Weather for Agriculture */}
              <View style={[styles.glassCard, styles.agricultureWeatherCard]}>
                <ExpoLinearGradient
                  colors={currentColors.primary}
                  style={styles.agricultureWeatherGradient}
                >
                  <Text style={[styles.agricultureCityName, { color: currentColors.textPrimary }]}>{agricultureData.city}</Text>
                  <Text style={[styles.agricultureTemperature, { color: currentColors.textPrimary }]}>{agricultureData.temperature}</Text>
                  <Text style={[styles.agricultureDescription, { color: currentColors.textSecondary }]}>{agricultureData.description}</Text>
                </ExpoLinearGradient>
              </View>

              {/* Plant Recommendations */}
              <View style={[styles.glassCard, styles.agricultureCard]}>
                <Text style={[styles.modernSectionTitle, { color: currentColors.textPrimary }]}>🌾 Bu Sıcaklığa Uygun Bitkiler</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsContainer}>
                  {getPlantsForTemperature(agricultureData.temperature).map((plant, index) => (
                    <View key={index} style={[styles.plantCard, { borderColor: currentColors.accent + '30' }]}>
                      <Text style={styles.plantEmoji}>{plant.emoji}</Text>
                      <Text style={[styles.plantName, { color: currentColors.textPrimary }]}>{plant.name}</Text>
                      <Text style={[styles.plantDescription, { color: currentColors.textSecondary }]}>{plant.description}</Text>
                      
                      <View style={styles.plantCharacteristics}>
                        {plant.characteristics.map((char, charIndex) => (
                          <Text key={charIndex} style={[styles.plantCharacteristic, { color: currentColors.textSecondary, borderColor: currentColors.accent + '20' }]}>
                            • {char}
                          </Text>
                        ))}
                      </View>
                      
                      <Text style={[styles.plantTips, { color: currentColors.textPrimary }]}>
                        💡 {plant.plantingTips}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Planting Advice */}
              <View style={[styles.glassCard, styles.agricultureCard]}>
                <Text style={[styles.agricultureCardTitle, { color: currentColors.textPrimary }]}>🌾 Ekim Tavsiyeleri</Text>
                <Text style={[styles.agricultureAdvice, { color: currentColors.textSecondary }]}>
                  {getPlantingAdvice(agricultureData.temperature)}
                </Text>
              </View>

              {/* Irrigation Advice */}
              <View style={[styles.glassCard, styles.agricultureCard]}>
                <Text style={[styles.agricultureCardTitle, { color: currentColors.textPrimary }]}>💧 Sulama Rehberi</Text>
                <Text style={[styles.agricultureAdvice, { color: currentColors.textSecondary }]}>
                  {getIrrigationAdvice(agricultureData.temperature)}
                </Text>
              </View>

              {/* Field Work Advice */}
              <View style={[styles.glassCard, styles.agricultureCard]}>
                <Text style={[styles.agricultureCardTitle, { color: currentColors.textPrimary }]}>🚜 Tarla İşleri</Text>
                <Text style={[styles.agricultureAdvice, { color: currentColors.textSecondary }]}>
                  {getFieldWorkAdvice(agricultureData.temperature)}
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </ExpoLinearGradient>
    );
  };

  const renderSettingsTab = () => (
    <ExpoLinearGradient
      colors={weatherColors.stormy.background}
      style={styles.gradientBackground}
    >
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.glassCard, styles.settingsHeader]}>
          <Text style={[styles.modernSectionTitle, { color: weatherColors.stormy.textPrimary }]}>⚙️ Ayarlar</Text>
          <Text style={[styles.settingsSubtitle, { color: weatherColors.stormy.textSecondary }]}>
            Uygulamayı kişiselleştirin
          </Text>
        </View>

        <View style={[styles.glassCard, styles.settingCard]}>
          <Text style={[styles.settingTitle, { color: weatherColors.stormy.textPrimary }]}>🌡️ Sıcaklık Birimi</Text>
          <View style={styles.settingOptions}>
            <TouchableOpacity
              style={[styles.settingOption, temperatureUnit === 'C' && styles.settingOptionActive]}
              onPress={() => setTemperatureUnit('C')}
            >
              <Text style={[
                styles.settingOptionText, 
                { color: temperatureUnit === 'C' ? weatherColors.stormy.textPrimary : weatherColors.stormy.textSecondary }
              ]}>
                Celsius (°C)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.settingOption, temperatureUnit === 'F' && styles.settingOptionActive]}
              onPress={() => setTemperatureUnit('F')}
            >
              <Text style={[
                styles.settingOptionText,
                { color: temperatureUnit === 'F' ? weatherColors.stormy.textPrimary : weatherColors.stormy.textSecondary }
              ]}>
                Fahrenheit (°F)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.glassCard, styles.settingCard]}>
          <Text style={[styles.settingTitle, { color: weatherColors.stormy.textPrimary }]}>🔔 Bildirimler</Text>
          <TouchableOpacity
            style={styles.settingToggle}
            onPress={() => setNotifications(!notifications)}
          >
            <Text style={[styles.settingToggleText, { color: weatherColors.stormy.textPrimary }]}>
              Hava durumu bildirimleri {notifications ? 'açık' : 'kapalı'}
            </Text>
            <Text style={styles.settingToggleIcon}>
              {notifications ? '🔔' : '🔕'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.glassCard, styles.aboutCard]}>
          <Text style={[styles.aboutTitle, { color: weatherColors.stormy.textPrimary }]}>📱 Uygulama Hakkında</Text>
          <Text style={[styles.aboutText, { color: weatherColors.stormy.textSecondary }]}>
            Modern Hava Durumu Asistanı v3.0{'\n'}
            AI destekli kıyafet ve aktivite önerileri ile community özelliği. Tarım rehberi ile günlük planlarınızı kolaylaştırın.
          </Text>
        </View>
      </ScrollView>
    </ExpoLinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Modern Tab Navigation */}
      <View style={styles.modernTabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
          {[
            { key: 'weather', icon: '🌤️', title: 'Hava Durumu' },
            { key: 'places', icon: '📍', title: 'Yerler' },
            { key: 'community', icon: '💬', title: 'Community' },
            { key: 'agriculture', icon: '🌱', title: 'Tarım' },
            { key: 'favorites', icon: '⭐', title: 'Favoriler' },
            { key: 'settings', icon: '⚙️', title: 'Ayarlar' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.modernTab,
                activeTab === tab.key && styles.modernTabActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.modernTabIcon,
                activeTab === tab.key && styles.modernTabIconActive,
              ]}>
                {tab.icon}
              </Text>
              <Text style={[
                styles.modernTabText,
                activeTab === tab.key && styles.modernTabTextActive,
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'weather' && renderWeatherTab()}
        {activeTab === 'places' && renderPlacesTab()}
        {activeTab === 'community' && renderCommunityTab()}
        {activeTab === 'agriculture' && renderAgricultureTab()}
        {activeTab === 'favorites' && renderFavoritesTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  
  // Modern Tab Navigation Styles
  modernTabContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.1)',
    paddingTop: Platform.OS === 'ios' ? 0 : 8,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabScrollView: {
    flexGrow: 0,
    paddingHorizontal: 16,
  },
  modernTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 25,
    minWidth: 90,
    backgroundColor: 'transparent',
  },
  modernTabActive: {
    backgroundColor: 'rgba(255, 140, 66, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
  },
  modernTabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  modernTabIconActive: {
    fontSize: 20,
  },
  modernTabText: {
    color: 'rgba(31, 41, 55, 0.6)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  modernTabTextActive: {
    color: '#FF8C42',
    fontWeight: '600',
  },

  // Content and Layout
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  gradientBackground: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },

  // Minimal Card Design - No backgrounds
  glassCard: {
    borderRadius: 0,
    padding: 0,
    marginBottom: 32,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },

  // Search Section
  searchSection: {
    marginBottom: 32,
  },
  modernInput: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    padding: 18,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  modernButton: {
    borderRadius: 25,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  modernButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Quick Cities Section
  quickCitiesContainer: {
    marginBottom: 32,
  },
  quickCityCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  quickCityEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickCityName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Main Weather Card - Clean design
  mainWeatherCard: {
    marginBottom: 40,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  temperatureGradient: {
    borderRadius: 30,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  weatherMainInfo: {
    flex: 1,
  },
  modernCityName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modernTemperature: {
    fontSize: 72,
    fontWeight: '200',
    marginBottom: 8,
    letterSpacing: -3,
  },
  modernDescription: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  modernFavoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  favoriteIcon: {
    fontSize: 22,
  },

  // Recommendation Cards - Clean transparent design
  recommendationCard: {
    marginBottom: 40,
  },
  modernSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  itemsContainer: {
    paddingBottom: 8,
  },
  recommendationItem: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    width: 140,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    minHeight: 130,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  itemEmoji: {
    fontSize: 28,
    marginBottom: 12,
    textAlign: 'center',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  itemDescription: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
    fontWeight: '400',
    opacity: 0.7,
  },
  locationTag: {
    fontSize: 9,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
    opacity: 0.6,
    letterSpacing: 0.2,
  },

  // Health Card
  healthCard: {
    marginBottom: 40,
  },
  healthAdviceContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  healthAdviceText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.9,
  },
  healthTips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  healthTip: {
    fontSize: 11,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    fontWeight: '500',
    letterSpacing: 0.2,
    opacity: 0.8,
  },

  // Welcome Card
  welcomeCard: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  welcomeDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.8,
  },

  // Community Section - Clean transparent design
  communityHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  communitySubtitle: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  createPostCard: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  postInput: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    textAlignVertical: 'top',
    minHeight: 80,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  postButton: {
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  postCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  postLocation: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.8,
  },
  postTime: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.8,
  },
  postContent: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    padding: 8,
    borderRadius: 15,
    backgroundColor: 'transparent',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  commentsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 140, 66, 0.2)',
    paddingTop: 16,
  },
  commentCard: {
    backgroundColor: 'transparent',
    padding: 12,
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 10,
    fontWeight: '400',
    opacity: 0.8,
  },
  commentInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    fontSize: 14,
  },
  commentButton: {
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  commentButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Favorites Section - Clean design
  favoritesHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  favoritesSubtitle: {
    fontSize: 13,
    marginTop: 8,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  emptyFavorites: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyFavoritesEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyFavoritesTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  emptyFavoritesText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  favoritesGrid: {
    flexDirection: 'column',
    paddingHorizontal: 4,
  },
  favoriteCard: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  favoriteCityName: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  removeButton: {
    padding: 8,
    borderRadius: 15,
    backgroundColor: 'transparent',
  },
  removeButtonText: {
    fontSize: 16,
    opacity: 0.6,
  },

  // Agriculture Section - Clean design
  agricultureHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  agricultureSubtitle: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  agricultureWeatherCard: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  agricultureWeatherGradient: {
    borderRadius: 30,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  agricultureCityName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  agricultureTemperature: {
    fontSize: 72,
    fontWeight: '200',
    marginBottom: 8,
    letterSpacing: -3,
  },
  agricultureDescription: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  agricultureCard: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  agricultureCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  agricultureAdvice: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.2,
    opacity: 0.8,
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
  },
  plantCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    width: 180,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    minHeight: 200,
    justifyContent: 'flex-start',
    alignItems: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  plantEmoji: {
    fontSize: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  plantName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  plantDescription: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
    fontWeight: '400',
    opacity: 0.7,
  },
  plantCharacteristics: {
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  plantCharacteristic: {
    fontSize: 9,
    fontWeight: '400',
    opacity: 0.7,
    marginBottom: 4,
    backgroundColor: 'transparent',
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    textAlign: 'center',
  },
  plantTips: {
    fontSize: 10,
    fontWeight: '400',
    opacity: 0.8,
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignSelf: 'stretch',
  },

  // Settings Section - Clean design
  settingsHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  settingsSubtitle: {
    fontSize: 13,
    marginTop: 8,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  settingCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  settingOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  settingOption: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
  },
  settingOptionActive: {
    backgroundColor: 'rgba(255, 140, 66, 0.2)',
    borderColor: 'rgba(255, 140, 66, 0.5)',
  },
  settingOptionText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  settingToggle: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
  },
  settingToggleText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  settingToggleIcon: {
    fontSize: 20,
    opacity: 0.8,
  },

  // About Section - Clean design
  aboutCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  aboutText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 20,
    fontWeight: '400',
    letterSpacing: 0.2,
    opacity: 0.7,
  },

  // Places Section - Clean design
  placesHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  placesSubtitle: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  placesWeatherCard: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  placesWeatherGradient: {
    borderRadius: 30,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  placesWeatherText: {
    fontSize: 72,
    fontWeight: '200',
    marginBottom: 8,
    letterSpacing: -3,
  },
  placesWeatherCity: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  placeCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    width: 180,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    minHeight: 200,
    justifyContent: 'flex-start',
    alignItems: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  placeEmoji: {
    fontSize: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  placeDescription: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
    fontWeight: '400',
    opacity: 0.7,
  },
  placeType: {
    fontSize: 9,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
    opacity: 0.6,
    letterSpacing: 0.2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  placeActivities: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  activitiesTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  activityItem: {
    fontSize: 10,
    fontWeight: '400',
    opacity: 0.8,
    marginBottom: 4,
  },
  favoritePlaces: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  favoritePlaceItem: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  favoritePlaceEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  favoritePlaceInfo: {
    alignItems: 'center',
  },
  favoritePlaceName: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  favoritePlaceDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
    fontWeight: '400',
    opacity: 0.7,
  },
  placesPlaceholder: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
});
