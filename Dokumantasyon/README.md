# Puzzdle Projesi - Çalıştırma Yönergesi

Sayın Hocam, projeyi bilgisayarınızda test etmek için aşağıdaki 4 adımı sırasıyla uygulayabilirsiniz:

## 1. Veritabanı (PostgreSQL) Hazırlığı
Proje, verilerini saklamak için PostgreSQL kullanmaktadır.
* Lütfen pgAdmin veya psql üzerinden **`puzzdle`** adında boş bir veritabanı (Database) oluşturun.
* `backend/config/db.js` dosyasını açın ve **9. satırdaki** `password` kısmına kendi bilgisayarınızdaki PostgreSQL şifrenizi yazın.

*(Not: Tabloları manuel oluşturmanıza gerek yoktur, sunucu ilk çalıştığında `schema.sql` dosyasını okuyup gerekli tüm tabloları otomatik olarak oluşturacaktır).*

## 2. Backend (Sunucu) Kurulumu
1. Terminal veya CMD üzerinden projenin içindeki **`backend`** klasörüne girin (`cd backend`).
2. Gerekli Node.js modüllerini indirmek için şu komutu çalıştırın:
   ```bash
   npm install
   ```
3. Sunucuyu başlatmak için şu komutu çalıştırın:
   ```bash
   npm run dev
   ```
*(Terminalde "PostgreSQL veritabanına başarıyla bağlanıldı" ve "Tablolar otomatik doğrulandı" mesajlarını göreceksiniz. Bu terminal penceresini arka planda açık bırakın).*

## 3. Frontend (İstemci) Kurulumu
1. Yeni bir terminal/CMD penceresi açın ve projenin içindeki **`frontend`** klasörüne girin (`cd frontend`).
2. Gerekli kütüphaneleri indirmek için şu komutu çalıştırın:
   ```bash
   npm install
   ```
3. Arayüzü derleyip başlatmak için şu komutu çalıştırın:
   ```bash
   npm run dev
   ```

## 4. Projeye Giriş
* Herhangi bir tarayıcı (Chrome, Edge vb.) açın.
* Adres çubuğuna **`http://localhost:3000`** yazarak projeye erişebilirsiniz.
* Düello (Multiplayer) ve Sesli Sohbet özelliklerini test etmek için gizli sekmeden farklı bir hesapla giriş yaparak aynı odaya katılabilirsiniz.

İyi çalışmalar dilerim.
