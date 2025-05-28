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
} from 'react-native';

const { width } = Dimensions.get('window');

interface WeatherData {
  city: string;
  temperature: string;
  description: string;
  clothingAdvice: string;
  activityAdvice: string;
  healthAdvice: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('weather');
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [temperatureUnit, setTemperatureUnit] = useState('C'); // C veya F
  const [language, setLanguage] = useState('TR');

  const quickCities = ['İstanbul', 'Ankara', 'İzmir', 'Antalya'];

  const getWeather = async (searchCity?: string) => {
    const targetCity = searchCity || city.trim();

    if (!targetCity) {
      Alert.alert('Hata', 'Lütfen bir şehir adı girin');
      return;
    }

    setLoading(true);
    setWeatherData(null);

    try {
      const response = await fetch('http://172.20.10.2:4111/api/agents/weather-assistant/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `${targetCity}'da hava nasıl? Sıcaklığı derece cinsinden söyle ve şu formatta öneriler ver:

👔 Kıyafet Önerileri: [kıyafet önerileri]
🎯 Aktivite Önerileri: [aktivite önerileri]
💊 Sağlık Tavsiyeleri: [sağlık tavsiyeleri]`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Agent Response:', data); // Debug için

      if (data.text) {
        parseWeatherResponse(data.text, targetCity);
      } else {
        Alert.alert('Hata', 'Hava durumu bilgisi alınamadı.');
      }
    } catch (error) {
      console.error('Hata:', error);
      Alert.alert('Hata', 'Hava durumu bilgisi alınırken bir hata oluştu. Sunucunun çalıştığından emin olun.');
    } finally {
      setLoading(false);
    }
  };

  const parseWeatherResponse = (response: string, cityName: string) => {
    console.log('Parsing response:', response); // Debug için

    // Gerçek sıcaklık değerini bul (daha gelişmiş regex)
    const tempMatch = response.match(/(\d+(?:\.\d+)?)°C/);
    const temperature = tempMatch ? tempMatch[1] + '°C' : 'N/A';

    // Agent'tan gelen gerçek önerileri parse et
    let clothingAdvice = 'Hava durumuna uygun kıyafetler seçin.';
    let activityAdvice = 'Hava durumuna uygun aktiviteler planlayın.';
    let healthAdvice = 'Sağlığınıza dikkat edin.';

    // Kıyafet önerilerini bul
    const clothingSection = response.match(/👔.*?(?=🎯|💊|$)/s);
    if (clothingSection) {
      clothingAdvice = clothingSection[0].replace(/👔.*?:?\s*/, '').trim();
    }

    // Aktivite önerilerini bul
    const activitySection = response.match(/🎯.*?(?=💊|👔|$)/s);
    if (activitySection) {
      activityAdvice = activitySection[0].replace(/🎯.*?:?\s*/, '').trim();
    }

    // Sağlık önerilerini bul
    const healthSection = response.match(/💊.*?(?=👔|🎯|$)/s);
    if (healthSection) {
      healthAdvice = healthSection[0].replace(/💊.*?:?\s*/, '').trim();
    }

    // Eğer emoji ile bulamazsa, alternatif anahtar kelimelerle ara
    if (clothingAdvice === 'Hava durumuna uygun kıyafetler seçin.') {
      if (response.includes('mont') || response.includes('kalın') || response.includes('sıcak tut')) {
        clothingAdvice = 'Kalın mont, eldiven, bere ve atkı giymeyi unutmayın.';
      } else if (response.includes('ceket') || response.includes('hırka') || response.includes('uzun kollu')) {
        clothingAdvice = 'Ceket veya hırka, uzun kollu tişört tercih edin.';
      } else if (response.includes('hafif') || response.includes('şort') || response.includes('ince')) {
        clothingAdvice = 'Hafif, nefes alan kumaşlar, şort ve sandalet tercih edin.';
      }
    }

    if (activityAdvice === 'Hava durumuna uygun aktiviteler planlayın.') {
      if (response.includes('iç mekan') || response.includes('evde kal')) {
        activityAdvice = 'İç mekan aktivitelerini tercih edin.';
      } else if (response.includes('yürüyüş') || response.includes('park')) {
        activityAdvice = 'Yürüyüş ve park gezileri için ideal hava.';
      } else if (response.includes('yüzme') || response.includes('plaj')) {
        activityAdvice = 'Yüzme, gölgede dinlenme ve erken saatlerde aktivite.';
      }
    }

    if (healthAdvice === 'Sağlığınıza dikkat edin.') {
      if (response.includes('vitamin') || response.includes('sıcak tut')) {
        healthAdvice = 'Vitamin C alın ve vücudunuzu sıcak tutun.';
      } else if (response.includes('bağışıklık') || response.includes('mevsim')) {
        healthAdvice = 'Mevsim geçişlerinde bağışıklık sisteminizi güçlendirin.';
      } else if (response.includes('su iç') || response.includes('güneş')) {
        healthAdvice = 'Bol su için, güneşten korunun.';
      }
    }

    setWeatherData({
      city: cityName,
      temperature,
      description: 'Güncel hava durumu',
      clothingAdvice,
      activityAdvice,
      healthAdvice,
    });
  };

  const addToFavorites = () => {
    if (weatherData && !favorites.includes(weatherData.city)) {
      const newFavorites = [...favorites, weatherData.city];
      setFavorites(newFavorites);
      Alert.alert('Başarılı', `${weatherData.city} favorilere eklendi!`);
    }
  };

  const removeFromFavorites = (cityToRemove: string) => {
    const newFavorites = favorites.filter(fav => fav !== cityToRemove);
    setFavorites(newFavorites);
    Alert.alert('Başarılı', `${cityToRemove} favorilerden kaldırıldı!`);
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

  const renderWeatherTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          placeholder="Şehir adı girin..."
          placeholderTextColor="#666"
          value={city}
          onChangeText={setCity}
          onSubmitEditing={() => getWeather()}
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => getWeather()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>🔍 Hava Durumunu Öğren</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.quickCities}>
        {quickCities.map((quickCity) => (
          <TouchableOpacity
            key={quickCity}
            style={styles.quickCityButton}
            onPress={() => quickSearch(quickCity)}
          >
            <Text style={styles.quickCityText}>📍 {quickCity}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {weatherData && (
        <View style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <View>
              <Text style={styles.cityName}>{weatherData.city}</Text>
              <Text style={styles.temperature}>{weatherData.temperature}</Text>
              <Text style={styles.description}>{weatherData.description}</Text>
            </View>
            <TouchableOpacity style={styles.favoriteButton} onPress={addToFavorites}>
              <Text style={styles.favoriteButtonText}>⭐</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.adviceSection}>
            <Text style={styles.adviceTitle}>👔 Kıyafet Önerileri</Text>
            <Text style={styles.adviceText}>{weatherData.clothingAdvice}</Text>
          </View>

          <View style={styles.adviceSection}>
            <Text style={styles.adviceTitle}>🎯 Aktivite Önerileri</Text>
            <Text style={styles.adviceText}>{weatherData.activityAdvice}</Text>
          </View>

          <View style={styles.adviceSection}>
            <Text style={styles.adviceTitle}>💊 Sağlık Tavsiyeleri</Text>
            <Text style={styles.adviceText}>{weatherData.healthAdvice}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderFavoritesTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>⭐ Favori Şehirlerim</Text>
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Henüz favori şehir eklenmemiş.{'\n'}
            Hava durumu sorgularından sonra ⭐ butonuna tıklayarak ekleyebilirsiniz.
          </Text>
        </View>
      ) : (
        favorites.map((favoriteCity) => (
          <TouchableOpacity
            key={favoriteCity}
            style={styles.favoriteItem}
            onPress={() => {
              setActiveTab('weather');
              quickSearch(favoriteCity);
            }}
          >
            <View style={styles.favoriteContent}>
              <Text style={styles.favoriteCityName}>📍 {favoriteCity}</Text>
              <Text style={styles.favoriteSubtext}>Hava durumunu görmek için tıklayın</Text>
            </View>
            <View style={styles.favoriteActions}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setActiveTab('weather');
                  quickSearch(favoriteCity);
                }}
                style={styles.actionButtonContainer}
              >
                <Text style={styles.actionButton}>🔍</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  removeFromFavorites(favoriteCity);
                }}
                style={styles.actionButtonContainer}
              >
                <Text style={styles.actionButton}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const renderAgricultureTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🌾 Tarım Rehberi</Text>

      <View style={styles.agricultureSection}>
        <Text style={styles.agricultureTitle}>🌱 Hava Durumuna Göre Tarım Önerileri</Text>
        <Text style={styles.agricultureSubtitle}>
          Şehir seçerek o bölgeye özel tarım tavsiyeleri alın
        </Text>
      </View>

      <View style={styles.quickCities}>
        {quickCities.map((quickCity) => (
          <TouchableOpacity
            key={quickCity}
            style={styles.agricultureCityButton}
            onPress={() => getAgricultureAdvice(quickCity)}
          >
            <Text style={styles.quickCityText}>🌾 {quickCity}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {weatherData && (
        <View style={styles.agricultureCard}>
          <Text style={styles.agricultureCardTitle}>
            🌾 {weatherData.city} - Tarım Tavsiyeleri
          </Text>
          <Text style={styles.agricultureCardTemp}>
            Sıcaklık: {weatherData.temperature}
          </Text>

          <View style={styles.agricultureAdvice}>
            <Text style={styles.agricultureAdviceTitle}>🌱 Ekim Önerileri</Text>
            <Text style={styles.agricultureAdviceText}>
              {getPlantingAdvice(weatherData.temperature)}
            </Text>
          </View>

          <View style={styles.agricultureAdvice}>
            <Text style={styles.agricultureAdviceTitle}>💧 Sulama Önerileri</Text>
            <Text style={styles.agricultureAdviceText}>
              {getIrrigationAdvice(weatherData.temperature)}
            </Text>
          </View>

          <View style={styles.agricultureAdvice}>
            <Text style={styles.agricultureAdviceTitle}>🚜 Tarla İşleri</Text>
            <Text style={styles.agricultureAdviceText}>
              {getFieldWorkAdvice(weatherData.temperature)}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>⚙️ Uygulama Ayarları</Text>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>🔔 Bildirim Ayarları</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Hava durumu bildirimleri</Text>
          <TouchableOpacity
            style={[styles.toggle, notifications && styles.toggleActive]}
            onPress={() => setNotifications(!notifications)}
          >
            <Text style={styles.toggleText}>{notifications ? 'AÇIK' : 'KAPALI'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>🌡️ Sıcaklık Birimi</Text>
        <View style={styles.settingItem}>
          <TouchableOpacity
            style={[styles.unitButton, temperatureUnit === 'C' && styles.unitButtonActive]}
            onPress={() => setTemperatureUnit('C')}
          >
            <Text style={[styles.unitButtonText, temperatureUnit === 'C' && styles.unitButtonTextActive]}>
              Celsius (°C)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, temperatureUnit === 'F' && styles.unitButtonActive]}
            onPress={() => setTemperatureUnit('F')}
          >
            <Text style={[styles.unitButtonText, temperatureUnit === 'F' && styles.unitButtonTextActive]}>
              Fahrenheit (°F)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>ℹ️ Uygulama Hakkında</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Akıllı Hava Durumu v3.0</Text>{'\n\n'}
            • Türkiye'nin tüm 81 ili desteklenir{'\n'}
            • Gerçek zamanlı hava durumu verisi{'\n'}
            • AI destekli kıyafet önerileri{'\n'}
            • Aktivite ve sağlık tavsiyeleri{'\n'}
            • Tarım rehberi ve önerileri{'\n'}
            • Gemini 2.0 Flash ile güçlendirilmiştir{'\n\n'}

            <Text style={styles.bold}>Geliştirici:</Text> AI Weather Assistant{'\n'}
            <Text style={styles.bold}>Versiyon:</Text> 3.0.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.appTitle}>🌤️ Akıllı Hava Durumu</Text>
        <Text style={styles.appSubtitle}>Yaşam Asistanınız</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'weather' && styles.activeTab]}
          onPress={() => setActiveTab('weather')}
        >
          <Text style={[styles.tabText, activeTab === 'weather' && styles.activeTabText]}>
            🌡️ Hava
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            ⭐ Favoriler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'agriculture' && styles.activeTab]}
          onPress={() => setActiveTab('agriculture')}
        >
          <Text style={[styles.tabText, activeTab === 'agriculture' && styles.activeTabText]}>
            🌾 Tarım
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            ⚙️ Ayarlar
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'weather' && renderWeatherTab()}
      {activeTab === 'favorites' && renderFavoritesTab()}
      {activeTab === 'agriculture' && renderAgricultureTab()}
      {activeTab === 'settings' && renderSettingsTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomColor: '#fff',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchButton: {
    backgroundColor: '#667eea',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickCities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickCityButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    width: (width - 50) / 2,
    marginBottom: 10,
    alignItems: 'center',
  },
  quickCityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonText: {
    fontSize: 18,
  },
  adviceSection: {
    marginBottom: 15,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  adviceText: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  favoriteItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteContent: {
    flex: 1,
  },
  favoriteCityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  favoriteSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  favoriteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButtonContainer: {
    padding: 5,
  },
  actionButton: {
    fontSize: 18,
    padding: 5,
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  infoText: {
    color: '#fff',
    lineHeight: 20,
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
  },
  // Tarım Tab Styles
  agricultureSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  agricultureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  agricultureSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  agricultureCityButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 12,
    padding: 12,
    width: (width - 50) / 2,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  agricultureCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  agricultureCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  agricultureCardTemp: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  agricultureAdvice: {
    marginBottom: 15,
  },
  agricultureAdviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  agricultureAdviceText: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    lineHeight: 20,
  },
  // Ayarlar Tab Styles
  settingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  toggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  unitButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: '#667eea',
  },
  unitButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: '#fff',
  },
});
