# PicRoad

Yürüyüş rotası ve fotoğraf baloncukları olan sosyal harita uygulaması (iki kişilik ekip).

## Yığın
React Native + Expo (TypeScript), Expo Router, zustand, react-native-maps, expo-location, expo-image-picker. Backend: Supabase (henüz bağlı değil).

## Kurallar
- Renk, köşe, boşluk değerleri sadece `src/theme.ts` içinde. Ekranlarda sabit hex yazma.
- Ekranlar (`app/`) ince kalsın; ortak parçalar `src/components`, mantık `src/lib` ve `src/store`.
- Metinler Türkçe/İngilizce karışık olabilir ama buton adı her yerde aynı kalsın ("Drop a photo").
- `.env` dosyası Git'e girmez; yeni anahtar eklenince `.env.example` güncellenir.
- Herkes kendi dalında çalışır, `main`'e Pull Request ile birleşir.

## Ürün kuralları
- Fotoğraf ve konum izi 24 saat sonra silinir. Fotoğraf 10.000 beğeniyi geçerse herkese açık olur.
- Rota ve fotoğraf ayrı ayrı gizlenebilir.
- Karar bekliyor: rotayı varsayılan olarak kimler görür (sadece ben mi, arkadaşlar mı)?

## Sürüm planı
1. MVP: harita, rota kaydı, fotoğraf baloncuğu, arkadaş ekleme (QR/nickname), gizlilik
2. Mesajlaşma, beğeni ve herkese açılma
3. PCoin, avatar mağazası, başarımlar
