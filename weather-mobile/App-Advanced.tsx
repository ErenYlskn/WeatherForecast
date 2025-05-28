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
      const response = await fetch('http://localhost:4111/api/agents/Hava%20Durumu%20Asistanı/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `${targetCity}'da hava nasıl? Detaylı kıyafet, aktivite ve sağlık önerileri ver.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

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
    const tempMatch = response.match(/(\d+)°C/);
    const temperature = tempMatch ? tempMatch[1] + '°C' : 'N/A';

    // Simple parsing for advice sections
    let clothingAdvice = 'Hava durumuna uygun kıyafetler seçin.';
    let activityAdvice = 'Hava durumuna uygun aktiviteler planlayın.';
    let healthAdvice = 'Sağlığınıza dikkat edin.';

    if (response.includes('mont') || response.includes('kalın')) {
      clothingAdvice = 'Kalın mont, eldiven, bere ve atkı giymeyi unutmayın.';
      activityAdvice = 'İç mekan aktivitelerini tercih edin.';
      healthAdvice = 'Vitamin C alın ve vücudunuzu sıcak tutun.';
    } else if (response.includes('ceket') || response.includes('hırka')) {
      clothingAdvice = 'Ceket veya hırka, uzun kollu tişört tercih edin.';
      activityAdvice = 'Yürüyüş ve park gezileri için ideal hava.';
      healthAdvice = 'Mevsim geçişlerinde bağışıklık sisteminizi güçlendirin.';
    } else if (response.includes('hafif') || response.includes('şort')) {
      clothingAdvice = 'Hafif, nefes alan kumaşlar, şort ve sandalet tercih edin.';
      activityAdvice = 'Yüzme, gölgede dinlenme ve erken saatlerde aktivite.';
      healthAdvice = 'Bol su için, güneşten korunun.';
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
          <View key={favoriteCity} style={styles.favoriteItem}>
            <View>
              <Text style={styles.favoriteCityName}>{favoriteCity}</Text>
              <Text style={styles.favoriteSubtext}>Favori şehir</Text>
            </View>
            <View style={styles.favoriteActions}>
              <TouchableOpacity onPress={() => quickSearch(favoriteCity)}>
                <Text style={styles.actionButton}>🔍</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeFromFavorites(favoriteCity)}>
                <Text style={styles.actionButton}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>⚙️ Uygulama Ayarları</Text>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>ℹ️ Uygulama Hakkında</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Akıllı Hava Durumu v2.0</Text>{'\n\n'}
            • Türkiye'nin tüm 81 ili desteklenir{'\n'}
            • Gerçek zamanlı hava durumu verisi{'\n'}
            • AI destekli kıyafet önerileri{'\n'}
            • Aktivite ve sağlık tavsiyeleri{'\n'}
            • Gemini 2.0 Flash ile güçlendirilmiştir{'\n\n'}

            <Text style={styles.bold}>Geliştirici:</Text> AI Weather Assistant{'\n'}
            <Text style={styles.bold}>Versiyon:</Text> 2.0.0
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
  favoriteCityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  favoriteSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  favoriteActions: {
    flexDirection: 'row',
    gap: 10,
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
});
