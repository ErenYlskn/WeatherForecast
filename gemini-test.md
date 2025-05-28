# Gemini Flash 2.0 Weather Agent Test Rehberi

## 🚀 Hızlı Başlangıç

1. **Gemini API Key alın**: https://aistudio.google.com/app/apikey
2. **API key'i .env dosyasına ekleyin**:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
   ```
3. **Sunucuyu başlatın**: `npm run dev`
4. **Playground'u açın**: http://localhost:4111/

## 🧪 Test Senaryoları

### Türkçe Şehir Testleri
Agent'a şu soruları sorun:

```
İstanbul'da şu an hava nasıl?
```

```
Ankara'nın şu anki sıcaklığı kaç derece?
```

```
İzmir'de hava durumu nasıl?
```

### Koordinat Testleri

```
41.0082, 28.9784 koordinatlarındaki sıcaklık nedir?
```

```
39.9334, 32.8597 koordinatları için hava durumu bilgisi ver.
```

### Karşılaştırma Testleri

```
İstanbul ve Ankara'nın sıcaklıklarını karşılaştır.
```

```
Türkiye'nin en büyük 3 şehrinin hava durumunu söyle.
```

## 🎯 Beklenen Davranışlar

- ✅ Agent Türkçe yanıt vermeli
- ✅ Şehir isimlerini koordinatlara çevirmeli
- ✅ Smithery API'sini çağırmalı
- ✅ Sıcaklık bilgisini doğal dilde sunmalı
- ✅ Hata durumlarında açıklayıcı mesaj vermeli

## 🔧 Debug

Eğer agent çalışmıyorsa:

1. **API Key kontrolü**: `.env` dosyasında doğru key var mı?
2. **Smithery bağlantısı**: URL erişilebilir mi?
3. **Console logları**: Terminal'de hata mesajları var mı?

## 📊 Performans

Gemini Flash 2.0'ın avantajları:
- ⚡ Çok hızlı yanıt süresi
- 🧠 Gelişmiş doğal dil anlama
- 🌍 Çok dilli destek
- 🔧 Tool kullanımında yüksek başarı oranı
