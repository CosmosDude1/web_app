# Görev & Proje Yönetim Sistemi - Proje Durumu

**Proje Adı:** Görev & Proje Yönetim Sistemi  
**Geliştirici:** Arda Meydan  
**Tarih:** 2025-01-XX  
**Git Repository:** https://github.com/CosmosDude1/web_app.git

---

## Proje Özeti

Bu proje, ekiplerin veya bireysel kullanıcıların görev ve projelerini dijital ortamda yönetmesini sağlayan bir sistemdir. ASP.NET Core 8.0 Web API backend ve React frontend ile geliştirilmektedir.

---

## Teknoloji Stack

- **Backend:** ASP.NET Core 8.0 Web API
- **Frontend:** React
- **Veritabanı:** Microsoft SQL Server Express (SQL Server Authentication / Windows Authentication)
- **ORM:** Entity Framework Core
- **Kimlik Doğrulama:** ASP.NET Identity + JWT
- **Mail:** MailKit (SMTP)
- **Grafikler:** Chart.js
- **API Dokümantasyonu:** Swagger UI
- **Geliştirme Ortamı:** Cursor + .NET CLI

---

## Proje Durumu

### ✅ Tamamlanan Kısımlar

1. **Git Repository Kurulumu**
   - Git repository başlatıldı
   - GitHub'a bağlandı
   - .gitignore dosyası oluşturuldu

### 🔄 Devam Eden Kısımlar

- Proje kurulumu aşamasında

### ⏳ Yapılacaklar

#### Backend
- [ ] ASP.NET Core 8.0 Web API projesi oluşturma
- [ ] NuGet paketlerinin eklenmesi
- [ ] Entity Framework modelleri (ApplicationUser, Project, Task, TaskAssignment, Attachment, Notification)
- [ ] ApplicationDbContext oluşturma
- [ ] SQL Server bağlantısı ve migration'lar
- [ ] ASP.NET Identity yapılandırması
- [ ] JWT Authentication yapılandırması
- [ ] API Controller'ları (Auth, Projects, Tasks, Dashboard, Calendar, Attachments)
- [ ] Servisler (EmailService, NotificationService, FileService)
- [ ] Swagger yapılandırması

#### Frontend
- [ ] React projesi oluşturma
- [ ] npm paketlerinin eklenmesi
- [ ] Temel UI tasarımı
- [ ] Authentication (Login/Register)
- [ ] Dashboard sayfası
- [ ] Proje yönetimi sayfaları
- [ ] Görev yönetimi sayfaları
- [ ] Takvim görünümü
- [ ] Chart.js entegrasyonu
- [ ] Dosya yükleme bileşenleri
- [ ] API entegrasyonu

#### Dokümantasyon
- [ ] API dokümantasyonu (Swagger)
- [ ] Proje dokümantasyonu güncellemeleri

---

## Gösterim İçin Gereksinimler

### Tasarım
- [ ] Temel UI tasarımı tamamlandı
- [ ] Login/Register sayfaları
- [ ] Dashboard görünümü
- [ ] Proje ve görev listeleri

### Veritabanı
- [ ] SQL Server bağlantısı kuruldu
- [ ] Migration'lar uygulandı
- [ ] Tablolar oluşturuldu
- [ ] Bağlantı test edildi

### API
- [ ] En az bir endpoint çalışıyor
- [ ] Swagger'da test edilebilir
- [ ] Veri çekme/gönderme gösterilebilir

---

## Notlar

- SQL Server Express kullanılıyor: `DESKTOP-OATVGP8\SQLEXPRESS`
- Windows Authentication ile bağlantı yapılacak
- Firebase kullanılmayacak (SQL Server kullanılacak)
- E-posta yapılandırması sonra eklenecek

---

## Son Güncelleme

**Tarih:** 2025-01-XX  
**Durum:** Proje başlangıç aşamasında

