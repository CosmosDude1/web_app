# TaskFlow - Görev ve Proje Yönetim Sistemi

## Final Proje Raporu

**Hazırlayan:** Arda Meydan  
**Tarih:** Ocak 2026  
**GitHub:** https://github.com/CosmosDude1/web_app.git  
**Video:** [BURAYA VİDEO LİNKİNİ EKLE]

---

## Giriş

Bu dönem boyunca üzerinde çalıştığım TaskFlow projesi, aslında kendi ihtiyacımdan doğdu. Ekip çalışmalarında sürekli "bu görevi kim yapacak?", "proje ne durumda?" gibi sorularla karşılaşıyordum. Excel tabloları ve WhatsApp grupları bir yere kadar işe yarıyordu ama profesyonel bir çözüm gerekiyordu. İşte bu yüzden kendi görev yönetim sistemimi geliştirmeye karar verdim.

Projenin temel amacı basit: Bir ekip ya da bireysel kullanıcı, projelerini oluşturabilsin, bu projelere görevler ekleyebilsin, görevleri ekip üyelerine atayabilsin ve herkes ne yapması gerektiğini net olarak görebilsin. Üstüne bir de bildirim sistemi ekledim ki kimse "ben görmedim" demesin.

---

## Neden Bu Teknolojileri Seçtim?

### Backend Tarafı

Backend için ASP.NET Core 8.0'ı tercih ettim. Aslında Node.js ile de yapabilirdim ama C#'ın tip güvenliği ve Visual Studio/Cursor'ın sunduğu intellisense desteği geliştirme sürecini çok kolaylaştırdı. Özellikle büyük projelerde "bu değişken ne tipindeydi?" diye düşünmek zorunda kalmamak büyük avantaj.

Veritabanı olarak SQL Server Express kullandım. Zaten bilgisayarımda kuruluydu ve Entity Framework Core ile mükemmel çalışıyor. Migration sistemi sayesinde veritabanı şemasını kod üzerinden yönetmek çok pratik oldu. Bir model değişikliği yaptığımda `dotnet ef migrations add` komutu ile anında veritabanını güncelleyebiliyorum.

Kimlik doğrulama için ASP.NET Identity ve JWT token kombinasyonunu kullandım. Identity, kullanıcı yönetimi için hazır bir altyapı sunuyor - şifre hash'leme, hesap kilitleme gibi güvenlik özelliklerini sıfırdan yazmak zorunda kalmadım. JWT ise frontend ile backend arasındaki iletişimi güvenli hale getiriyor.

### Frontend Tarafı

Frontend'de React tercih ettim. Component bazlı yapısı sayesinde kodu modüler tutmak kolay. Mesela Navbar component'ını bir kere yazıp tüm sayfalarda kullanabiliyorum. Ayrıca React'in büyük bir topluluğu var, takıldığım yerlerde çözüm bulmak hiç zor olmadı.

Grafikleri göstermek için Chart.js kütüphanesini kullandım. Dashboard sayfasında görev dağılımlarını pasta grafiği ve bar chart ile gösteriyorum. Kullanıcı bir bakışta projenin durumunu anlayabiliyor.

---

## Projenin Yapısı

### Veritabanı Tasarımı

Veritabanını tasarlarken önce kağıt üzerinde ilişkileri çizdim. Temel tablolarım şunlar:

**Kullanıcılar (AspNetUsers):** ASP.NET Identity'nin standart tablosu. Ben sadece FirstName ve LastName alanlarını ekledim. Email zaten Identity tarafından yönetiliyor.

**Projeler (Projects):** Her projenin bir adı, açıklaması, durumu ve tarihleri var. Durumlar için enum kullandım - NotStarted, InProgress, Completed gibi. Bu sayede veritabanında tutarsız veri olmuyor.

**Görevler (Tasks):** Görevler projelere bağlı. Her görevin bir önceliği var (Low, Medium, High, Critical) ve bir durumu var. Bir görevi birden fazla kişiye atayabilmek için ayrı bir TaskAssignments tablosu oluşturdum. Bu many-to-many ilişki sayesinde esneklik sağladım.

**Bildirimler (Notifications):** Kim, ne zaman, ne hakkında bildirim aldı - hepsini bu tabloda tutuyorum. Okundu/okunmadı bilgisi de burada.

**Aktivite Logları (ActivityLogs):** Sistemde yapılan her önemli işlemi kaydediyorum. Kim, ne zaman, ne yaptı. Bu hem güvenlik hem de debug için çok faydalı.

### Rol Sistemi

Üç farklı rol tanımladım ve her birinin yetkileri farklı:

**Admin** her şeyi yapabilir. Proje silme, kullanıcı yönetimi, sistem ayarları - hepsi Admin'e açık.

**Yönetici** proje ve görev oluşturabilir, güncelleyebilir. Takım üyelerine görev atayabilir. Ama proje silemez, o yetki sadece Admin'de.

**User** ise sadece kendisine atanan görevleri görebilir ve bu görevlerin durumunu güncelleyebilir. Mesela "Devam Ediyor" olan bir görevi "Tamamlandı" yapabilir. Ama yeni görev oluşturamaz veya başkasının görevini göremez.

Bu ayrımı yapmak backend'de biraz uğraştırdı. Her endpoint'te kullanıcının rolünü kontrol edip ona göre veri filtrelemem gerekti. Ama sonuçta güvenli bir sistem ortaya çıktı.

---

## Öne Çıkan Özellikler

### Bildirim Sistemi

En çok emek verdiğim kısımlardan biri bildirim sistemi oldu. Sadece uygulama içi bildirim değil, email bildirimi de ekledim.

Çalışma mantığı şöyle: Bir yönetici birine görev atadığında, NotificationService devreye giriyor. Önce veritabanına bildirim kaydı oluşturuyor, sonra da kullanıcının emailine bildirim gönderiyor. Email gönderimini try-catch içine aldım çünkü email sunucusu sorun çıkarsa bile en azından uygulama içi bildirim kaybolmasın istedim.

Email için MailKit kütüphanesini kullandım ve Gmail SMTP sunucusunu tercih ettim. Gmail'in uygulama şifresi özelliği sayesinde normal şifremi paylaşmadan email gönderebiliyorum. HTML formatında şablonlar hazırladım, emailler düz metin yerine güzel görünüyor.

### Aktivite Log Sistemi

Her önemli işlem kaydediliyor. Mesela bir görev oluşturulduğunda "Arda Meydan 'Backend API Geliştirme' görevini oluşturdu" şeklinde bir kayıt düşüyor. Bu kayıtları Dashboard'da son aktiviteler olarak gösteriyorum.

Bu sistem debug için de çok faydalı oldu. Bir şey ters gittiğinde logları inceleyerek sorunu bulabiliyorum.

### Takvim Görünümü

Görevleri sadece liste halinde değil, takvim üzerinde de göstermek istedim. Her görevin bitiş tarihine göre takvimde gösteriliyor. Önceliğe göre renkler farklı - kritik görevler kırmızı, normal görevler mavi gibi.

React'te takvim component'ını sıfırdan yazdım. Ay geçişleri, gün hesaplamaları derken biraz uğraştım ama sonuç güzel oldu.

### Dashboard

Dashboard'u açtığınızda bir bakışta her şeyi görebiliyorsunuz:
- Kaç proje var, kaçı tamamlanmış
- Kaç görev var, durumlarına göre dağılım
- Öncelik bazlı görev dağılımı (pasta grafiği)
- Son yapılan aktiviteler
- Yaklaşan görevler

Chart.js ile grafikler ekledim. Doughnut chart görev durumlarını, bar chart ise öncelikleri gösteriyor.

---

## Koddan Örnekler

### Görev Oluşturma Akışı

Bir görev oluşturulduğunda neler oluyor, adım adım anlatayım:

1. Frontend'de kullanıcı formu doldurup "Kaydet" diyor
2. React, taskService üzerinden POST isteği gönderiyor
3. Backend'de TasksController bu isteği alıyor
4. Önce kullanıcının yetkisi kontrol ediliyor (Admin veya Yönetici mi?)
5. Görev veritabanına kaydediliyor
6. Atanan kullanıcılar için TaskAssignment kayıtları oluşturuluyor
7. ActivityLogService ile log kaydı düşülüyor
8. Her atanan kullanıcı için NotificationService ile bildirim oluşturuluyor
9. Bildirimle birlikte email de gönderiliyor
10. Frontend'e başarılı yanıt dönüyor

Bu akışta try-catch bloklarını stratejik kullandım. Mesela email gönderimi başarısız olsa bile görev oluşturma işlemi iptal olmuyor. Kullanıcı deneyimini bozmamak için bu tür kararlar önemli.

### Rol Bazlı Filtreleme

Normal bir kullanıcı görev listesini istediğinde, sadece kendisine atanan görevleri görmeli. Bunu şöyle çözdüm:

```csharp
if (!isAdmin && !isManager)
{
    query = query.Where(t => t.Assignments.Any(a => a.AssignedToUserId == userId));
}
```

Bu LINQ sorgusu, görevlerin atamalarına bakıyor ve sadece o kullanıcıya atananları filtreliyor. Admin ve Yönetici ise bu filtreyi bypass ediyor, tüm görevleri görebiliyor.

---

## Arayüz Tasarımı

Başlangıçta tasarım oldukça sade ve standart görünüyordu. Sonradan modernize ettim - mor/indigo tonlarında bir renk paleti seçtim, kartlara gölgeler ekledim, hover efektleri koydum.

Login sayfasında gradient arka plan kullandım. Dashboard'da kartlar biraz yukarı kalkıyor hover'da. Küçük detaylar ama kullanıcı deneyimini iyileştiriyor.

Responsive tasarıma da dikkat ettim. Mobilde de düzgün görünüyor, menü hamburger ikona dönüşüyor.

---

## Karşılaştığım Zorluklar

### Entity Framework Migration Sorunları

İlk başta modeller arasındaki ilişkileri yanlış kurmuştum. Circular reference hataları aldım. Çözüm için navigation property'leri düzgün tanımlamam ve foreign key'leri explicit belirtmem gerekti.

### JWT Token'da Roller

Token oluştururken rolleri claim olarak eklemeyi unutmuştum. Frontend'de kullanıcı Admin olmasına rağmen yetkileri yokmuş gibi davranıyordu. Saatlerce debug ettikten sonra token içeriğine baktım ve rollerin eksik olduğunu gördüm.

### CORS Problemi

Frontend localhost:3000'de, backend localhost:5226'da çalışıyor. Başta CORS ayarlarını yapmadığım için istekler bloklanıyordu. Program.cs'de CORS policy ekleyerek çözdüm.

### Gmail Email Gönderimi

Gmail normal şifre ile çalışmıyor, "Uygulama Şifresi" oluşturmak gerekiyor. Bunu öğrenmem biraz zaman aldı. Ayrıca 2 aşamalı doğrulama açık olmalı.

---

## Yapay Zeka Kullanımı

Bu projede Cursor AI'dan yardım aldım. Özellikle şu konularda faydalı oldu:

**Email Entegrasyonu:** MailKit kütüphanesini ilk kez kullanıyordum. AI, SMTP bağlantısı kurma ve HTML email gönderme konusunda yol gösterdi.

**Aktivite Log Sistemi:** Log servisinin tasarımında ve enum tiplerinin belirlenmesinde yardım aldım.

**CSS Modernizasyonu:** Arayüzü güzelleştirirken gradient'lar, shadow'lar ve animasyonlar konusunda öneriler aldım.

Ama önemli olan şu: AI'ın yazdığı her kodu inceledim ve anladım. Copy-paste yapmadım. Mesela Dependency Injection'ın ne olduğunu, async/await'in nasıl çalıştığını, LINQ sorgularının ne yaptığını öğrendim. AI bir öğretmen gibi davrandı, ben de öğrenci.

---

## Projeyi Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için:

**Backend:**
1. SQL Server Express kurulu olmalı
2. `backend/TaskManagementAPI` klasörüne git
3. `appsettings.example.json` dosyasını `appsettings.json` olarak kopyala
4. Connection string'i kendi SQL Server'ına göre düzenle
5. Email ayarlarını gir (Gmail + Uygulama Şifresi)
6. `dotnet ef database update` ile veritabanını oluştur
7. `dotnet run` ile çalıştır

**Frontend:**
1. Node.js kurulu olmalı
2. `frontend` klasörüne git
3. `npm install` ile bağımlılıkları yükle
4. `npm start` ile çalıştır

Backend http://localhost:5226'da, frontend http://localhost:3000'de açılacak. Swagger UI için http://localhost:5226/swagger adresine git.

---

## Sonuç

Bu proje benim için çok öğretici oldu. Sadece kod yazmayı değil, bir projeyi baştan sona planlayıp geliştirmeyi öğrendim. Veritabanı tasarımı, API geliştirme, frontend-backend entegrasyonu, güvenlik, kullanıcı deneyimi - hepsini bir arada düşünmek zorunda kaldım.

Tamamlanan özellikler:
- Kullanıcı kayıt ve giriş
- JWT authentication
- Rol bazlı yetkilendirme
- Proje ve görev yönetimi
- Çoklu kullanıcı atama
- Bildirim sistemi (uygulama içi + email)
- Aktivite logları
- Dashboard ve grafikler
- Takvim görünümü
- Dosya yükleme

İleride eklemek istediğim özellikler var: SignalR ile real-time bildirimler, yorum sistemi, raporlama ve export özellikleri, belki bir mobil uygulama.

Projeyi geliştirirken hem eğlendim hem de çok şey öğrendim. Umarım bu rapor projeyi anlamanıza yardımcı olmuştur.

---

**Arda Meydan**  
*Ocak 2026*
