# TaskFlow - Görev ve Proje Yönetim Sistemi

## Final Proje Raporu

**Proje Adı:** TaskFlow - Görev ve Proje Yönetim Sistemi  
**Geliştirici:** Arda Meydan  
**Tarih:** Ocak 2026  
**GitHub Repository:** https://github.com/CosmosDude1/web_app.git  
**Video Linki:** [BURAYA VİDEO LİNKİNİ EKLE]

---

## 1. Proje Özeti

TaskFlow, ekiplerin ve bireysel kullanıcıların projelerini ve görevlerini dijital ortamda etkin bir şekilde yönetmelerini sağlayan kapsamlı bir web uygulamasıdır. Sistem, modern web teknolojileri kullanılarak geliştirilmiş olup, kullanıcı dostu arayüzü ve güçlü backend altyapısı ile profesyonel düzeyde bir proje yönetim deneyimi sunmaktadır.

### 1.1 Projenin Amacı

- Proje ve görev takibini kolaylaştırmak
- Ekip içi iş birliğini artırmak
- Görev atama ve takibini otomatikleştirmek
- Bildirim sistemi ile kullanıcıları güncel tutmak
- Email entegrasyonu ile uzaktan erişim sağlamak

### 1.2 Hedef Kitle

- Yazılım geliştirme ekipleri
- Proje yöneticileri
- Küçük ve orta ölçekli işletmeler
- Bireysel kullanıcılar

---

## 2. Teknoloji Stack

### 2.1 Backend Teknolojileri

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| ASP.NET Core | 8.0 | Web API framework |
| Entity Framework Core | 8.0 | ORM (Object-Relational Mapping) |
| Microsoft SQL Server | Express | Veritabanı |
| ASP.NET Identity | 8.0 | Kimlik doğrulama ve yetkilendirme |
| JWT (JSON Web Token) | - | Token tabanlı authentication |
| MailKit | 4.x | SMTP email gönderimi |
| Swagger/OpenAPI | 6.x | API dokümantasyonu |

### 2.2 Frontend Teknolojileri

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| React | 18.x | UI framework |
| React Router DOM | 6.x | Sayfa yönlendirme |
| Axios | 1.x | HTTP istekleri |
| Chart.js | 4.x | Grafik ve istatistikler |
| date-fns | 2.x | Tarih işlemleri |
| CSS3 | - | Stil ve tasarım |

### 2.3 Geliştirme Araçları

- **IDE:** Cursor (AI destekli)
- **Versiyon Kontrol:** Git & GitHub
- **API Test:** Swagger UI
- **Veritabanı Yönetimi:** SQL Server Management Studio

---

## 3. Sistem Mimarisi

### 3.1 Genel Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Pages  │ │Services │ │ Context │ │Components│           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend (ASP.NET Core 8.0)                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Controllers │ │  Services   │ │    DTOs     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Models    │ │ Middleware  │ │   Identity  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Entity Framework Core
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              SQL Server Express Database                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Users  │ │Projects │ │  Tasks  │ │  Logs   │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Backend Klasör Yapısı

```
backend/TaskManagementAPI/
├── Controllers/           # API endpoint'leri
│   ├── AuthController.cs          # Kimlik doğrulama
│   ├── ProjectsController.cs      # Proje yönetimi
│   ├── TasksController.cs         # Görev yönetimi
│   ├── DashboardController.cs     # İstatistikler
│   ├── CalendarController.cs      # Takvim verileri
│   ├── NotificationsController.cs # Bildirimler
│   ├── ActivityLogsController.cs  # Aktivite kayıtları
│   ├── AttachmentsController.cs   # Dosya yönetimi
│   └── UsersController.cs         # Kullanıcı yönetimi
├── Models/                # Entity modelleri
│   ├── ApplicationUser.cs
│   ├── Project.cs
│   ├── Task.cs
│   ├── TaskAssignment.cs
│   ├── Notification.cs
│   ├── ActivityLog.cs
│   └── Attachment.cs
├── DTOs/                  # Data Transfer Objects
│   ├── AuthResponseDto.cs
│   ├── LoginDto.cs
│   ├── RegisterDto.cs
│   ├── ProjectDto.cs
│   ├── TaskDto.cs
│   ├── NotificationDto.cs
│   └── ActivityLogDto.cs
├── Services/              # İş mantığı servisleri
│   ├── EmailService.cs
│   ├── NotificationService.cs
│   ├── FileService.cs
│   └── ActivityLogService.cs
├── Data/                  # Veritabanı context
│   └── ApplicationDbContext.cs
├── Migrations/            # EF Core migration'ları
├── Program.cs             # Uygulama başlangıç noktası
└── appsettings.json       # Yapılandırma dosyası
```

### 3.3 Frontend Klasör Yapısı

```
frontend/src/
├── pages/                 # Sayfa bileşenleri
│   ├── Login.js
│   ├── Register.js
│   ├── Dashboard.js
│   ├── Projects.js
│   ├── ProjectDetail.js
│   ├── ProjectForm.js
│   ├── Tasks.js
│   ├── TaskDetail.js
│   ├── TaskForm.js
│   ├── Calendar.js
│   └── Notifications.js
├── components/            # Yeniden kullanılabilir bileşenler
│   ├── Navbar.js
│   ├── ProtectedRoute.js
│   └── FileUpload.js
├── services/              # API servisleri
│   ├── api.js
│   ├── authService.js
│   ├── projectService.js
│   ├── taskService.js
│   ├── dashboardService.js
│   ├── notificationService.js
│   ├── activityLogService.js
│   ├── attachmentService.js
│   └── userService.js
├── context/               # React Context
│   └── AuthContext.js
├── utils/                 # Yardımcı fonksiyonlar
│   └── jwt.js
├── App.js                 # Ana uygulama bileşeni
├── App.css                # Global stiller
└── index.js               # Giriş noktası
```

---

## 4. Veritabanı Tasarımı

### 4.1 ER Diyagramı

```
┌─────────────────┐       ┌─────────────────┐
│  AspNetUsers    │       │   AspNetRoles   │
├─────────────────┤       ├─────────────────┤
│ Id (PK)         │──┐    │ Id (PK)         │
│ FirstName       │  │    │ Name            │
│ LastName        │  │    └─────────────────┘
│ Email           │  │            │
│ PasswordHash    │  │            │
└─────────────────┘  │    ┌───────┴───────┐
        │            │    │AspNetUserRoles│
        │            │    ├───────────────┤
        │            └───>│ UserId (FK)   │
        │                 │ RoleId (FK)   │
        │                 └───────────────┘
        │
        ├──────────────────────────────────┐
        │                                  │
        ▼                                  ▼
┌─────────────────┐               ┌─────────────────┐
│    Projects     │               │     Tasks       │
├─────────────────┤               ├─────────────────┤
│ Id (PK)         │◄──────────────│ Id (PK)         │
│ Name            │               │ Title           │
│ Description     │               │ Description     │
│ Status          │               │ Status          │
│ StartDate       │               │ Priority        │
│ EndDate         │               │ StartDate       │
│ CreatedByUserId │               │ DueDate         │
│ CreatedAt       │               │ ProjectId (FK)  │
└─────────────────┘               │ CreatedByUserId │
        │                         │ CreatedAt       │
        │                         └─────────────────┘
        │                                  │
        │                                  │
        │                                  ▼
        │                         ┌─────────────────┐
        │                         │ TaskAssignments │
        │                         ├─────────────────┤
        │                         │ Id (PK)         │
        │                         │ TaskId (FK)     │
        │                         │ AssignedToUserId│
        │                         │ AssignedAt      │
        │                         └─────────────────┘
        │
        ├──────────────────────────────────┐
        │                                  │
        ▼                                  ▼
┌─────────────────┐               ┌─────────────────┐
│  Notifications  │               │  ActivityLogs   │
├─────────────────┤               ├─────────────────┤
│ Id (PK)         │               │ Id (PK)         │
│ UserId (FK)     │               │ UserId (FK)     │
│ Title           │               │ Action          │
│ Message         │               │ Description     │
│ Type            │               │ ActivityType    │
│ IsRead          │               │ TaskId (FK)     │
│ TaskId (FK)     │               │ ProjectId (FK)  │
│ ProjectId (FK)  │               │ CreatedAt       │
│ CreatedAt       │               └─────────────────┘
└─────────────────┘
        │
        │
        ▼
┌─────────────────┐
│   Attachments   │
├─────────────────┤
│ Id (PK)         │
│ FileName        │
│ FilePath        │
│ FileSize        │
│ TaskId (FK)     │
│ UploadedByUserId│
│ UploadedAt      │
└─────────────────┘
```

### 4.2 Tablo Açıklamaları

#### AspNetUsers (Kullanıcılar)
ASP.NET Identity tarafından yönetilen kullanıcı tablosu. Ek alanlar olarak `FirstName` ve `LastName` eklenmiştir.

#### Projects (Projeler)
| Alan | Tip | Açıklama |
|------|-----|----------|
| Id | int | Primary Key |
| Name | string(200) | Proje adı |
| Description | string(2000) | Proje açıklaması |
| Status | enum | NotStarted, InProgress, Completed, OnHold, Cancelled |
| StartDate | DateTime | Başlangıç tarihi |
| EndDate | DateTime? | Bitiş tarihi |
| CreatedByUserId | string | Oluşturan kullanıcı |
| CreatedAt | DateTime | Oluşturulma zamanı |

#### Tasks (Görevler)
| Alan | Tip | Açıklama |
|------|-----|----------|
| Id | int | Primary Key |
| Title | string(200) | Görev başlığı |
| Description | string(2000) | Görev açıklaması |
| Status | enum | ToDo, InProgress, InReview, Completed, Cancelled |
| Priority | enum | Low, Medium, High, Critical |
| StartDate | DateTime | Başlangıç tarihi |
| DueDate | DateTime? | Bitiş tarihi |
| ProjectId | int | İlişkili proje |
| CreatedByUserId | string | Oluşturan kullanıcı |

#### TaskAssignments (Görev Atamaları)
Görev ve kullanıcı arasında çoktan çoğa (many-to-many) ilişki sağlar. Bir göreve birden fazla kullanıcı atanabilir.

#### Notifications (Bildirimler)
| Alan | Tip | Açıklama |
|------|-----|----------|
| Type | enum | TaskAssigned, TaskUpdated, TaskCompleted, ProjectUpdated, Comment, System |

#### ActivityLogs (Aktivite Kayıtları)
Sistemde yapılan tüm önemli işlemlerin kaydını tutar.

---

## 5. API Endpoint'leri

### 5.1 Authentication API

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı | Public |
| POST | `/api/auth/login` | Kullanıcı girişi | Public |
| GET | `/api/auth/me` | Mevcut kullanıcı bilgisi | Authenticated |

### 5.2 Projects API

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| GET | `/api/projects` | Proje listesi | All Users |
| GET | `/api/projects/{id}` | Proje detayı | All Users |
| POST | `/api/projects` | Yeni proje oluştur | Admin, Yönetici |
| PUT | `/api/projects/{id}` | Proje güncelle | Admin, Yönetici |
| DELETE | `/api/projects/{id}` | Proje sil | Admin |

### 5.3 Tasks API

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| GET | `/api/tasks` | Görev listesi | All Users (filtrelenir) |
| GET | `/api/tasks/{id}` | Görev detayı | Atanan/Admin/Yönetici |
| POST | `/api/tasks` | Yeni görev oluştur | Admin, Yönetici |
| PUT | `/api/tasks/{id}` | Görev güncelle | Atanan (sadece durum), Admin/Yönetici (tümü) |
| DELETE | `/api/tasks/{id}` | Görev sil | Admin |

### 5.4 Notifications API

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| GET | `/api/notifications` | Bildirim listesi | Authenticated |
| GET | `/api/notifications/unread-count` | Okunmamış bildirim sayısı | Authenticated |
| PUT | `/api/notifications/{id}/read` | Bildirimi okundu işaretle | Authenticated |
| PUT | `/api/notifications/mark-all-read` | Tümünü okundu işaretle | Authenticated |

### 5.5 Dashboard API

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| GET | `/api/dashboard/stats` | İstatistikler | Authenticated |
| GET | `/api/dashboard/recent-activities` | Son aktiviteler | Authenticated |

### 5.6 Calendar API

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| GET | `/api/calendar/tasks` | Takvim görevleri | Authenticated |

### 5.7 Attachments API

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| GET | `/api/attachments/task/{taskId}` | Göreve ait dosyalar | Authenticated |
| POST | `/api/attachments/upload` | Dosya yükle | Authenticated |
| GET | `/api/attachments/download/{id}` | Dosya indir | Authenticated |
| DELETE | `/api/attachments/{id}` | Dosya sil | Admin, Yönetici |

---

## 6. Özellikler ve İşlevsellik

### 6.1 Kullanıcı Yönetimi

#### Kayıt ve Giriş
- Email ve şifre ile kayıt
- JWT token tabanlı kimlik doğrulama
- Token süresi: 60 dakika
- Şifre gereksinimleri: En az 6 karakter, büyük harf, küçük harf, rakam

#### Rol Sistemi
Sistemde 3 rol bulunmaktadır:

| Rol | Yetkiler |
|-----|----------|
| **Admin** | Tam yetki: Tüm CRUD işlemleri, kullanıcı yönetimi, sistem ayarları |
| **Yönetici** | Proje ve görev oluşturma/güncelleme, kullanıcılara görev atama |
| **User** | Sadece atanan görevleri görme ve durum güncelleme |

### 6.2 Proje Yönetimi

- Proje oluşturma ve düzenleme
- Proje durumu takibi (NotStarted, InProgress, Completed, OnHold, Cancelled)
- Proje bazlı görev listeleme
- Proje istatistikleri (toplam görev, tamamlanan, devam eden)

### 6.3 Görev Yönetimi

- Görev oluşturma ve atama
- Öncelik seviyeleri (Low, Medium, High, Critical)
- Durum takibi (ToDo, InProgress, InReview, Completed, Cancelled)
- Çoklu kullanıcı atama
- Dosya ekleme
- Bitiş tarihi takibi

### 6.4 Bildirim Sistemi

#### Uygulama İçi Bildirimler
- Yeni görev atandığında
- Görev güncellendiğinde
- Görev tamamlandığında
- Proje güncellendiğinde

#### Email Bildirimleri
- SMTP üzerinden Gmail entegrasyonu
- HTML formatlı email şablonları
- Otomatik bildirim gönderimi

**NotificationService Çalışma Mantığı:**
```csharp
public async Task CreateNotificationAsync(...)
{
    // 1. Bildirimi veritabanına kaydet
    var notification = new Notification { ... };
    _context.Notifications.Add(notification);
    await _context.SaveChangesAsync();

    // 2. Email gönder (try-catch ile - hata bildirimi engellemez)
    try
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user != null && !string.IsNullOrEmpty(user.Email))
        {
            await _emailService.SendEmailAsync(user.Email, subject, body);
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"E-posta hatası: {ex.Message}");
    }
}
```

### 6.5 Aktivite Log Sistemi

Sistemde yapılan tüm önemli işlemler kaydedilir:
- Proje oluşturma/güncelleme/silme
- Görev oluşturma/güncelleme/silme
- Durum değişiklikleri
- Dosya yükleme/silme

### 6.6 Takvim Görünümü

- Aylık takvim görünümü
- Görevlerin bitiş tarihlerine göre listeleme
- Renk kodlu görev gösterimi (öncelik ve duruma göre)

### 6.7 Dashboard

- Toplam proje ve görev sayıları
- Durum bazlı dağılım grafikleri (Doughnut chart)
- Öncelik bazlı dağılım grafikleri (Bar chart)
- Son aktiviteler listesi
- Yaklaşan görevler

---

## 7. Güvenlik Önlemleri

### 7.1 Authentication & Authorization

```csharp
// JWT yapılandırması
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        // ...
    };
});
```

### 7.2 Rol Bazlı Yetkilendirme

```csharp
// Controller seviyesinde
[Authorize(Roles = "Admin,Yönetici")]
public async Task<ActionResult> CreateTask(...)

// Metod içinde dinamik kontrol
if (!isAdmin && !isManager)
{
    query = query.Where(t => t.Assignments.Any(a => a.AssignedToUserId == userId));
}
```

### 7.3 CORS Yapılandırması

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### 7.4 Şifre Güvenliği

- ASP.NET Identity ile hash'lenmiş şifre saklama
- Güçlü şifre gereksinimleri
- Hesap kilitleme (5 başarısız deneme sonrası)

---

## 8. Kullanıcı Arayüzü

### 8.1 Tasarım Prensipleri

- Modern ve minimalist tasarım
- Mor/İndigo renk paleti (#6366f1 ana renk)
- Responsive tasarım (mobil uyumlu)
- Animasyonlar ve geçişler
- Tutarlı bileşen tasarımı

### 8.2 Sayfa Açıklamaları

#### Login/Register
- Gradient arka plan
- Merkezi form tasarımı
- Form validasyonu

#### Dashboard
- İstatistik kartları
- Chart.js grafikleri
- Son aktiviteler listesi

#### Projeler/Görevler
- Kart bazlı listeleme
- Filtreleme seçenekleri
- Durum badge'leri

#### Detay Sayfaları
- İki sütunlu layout
- İlişkili veriler
- Aksiyon butonları

#### Takvim
- Interaktif takvim grid'i
- Renk kodlu görevler
- Hover efektleri

---

## 9. Kurulum ve Çalıştırma

### 9.1 Gereksinimler

- .NET 8.0 SDK
- Node.js 18+
- SQL Server Express
- Git

### 9.2 Backend Kurulumu

```bash
# Repository'yi klonla
git clone https://github.com/CosmosDude1/web_app.git
cd web_app

# Backend dizinine git
cd backend/TaskManagementAPI

# appsettings.json oluştur (appsettings.example.json'dan kopyala)
# Connection string ve email ayarlarını düzenle

# Migration'ları uygula
dotnet ef database update

# Uygulamayı çalıştır
dotnet run
```

### 9.3 Frontend Kurulumu

```bash
# Frontend dizinine git
cd frontend

# Bağımlılıkları yükle
npm install

# Uygulamayı çalıştır
npm start
```

### 9.4 Erişim URL'leri

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5226
- **Swagger UI:** http://localhost:5226/swagger

---

## 10. Yapay Zeka Kullanımı

Bu projede Cursor AI'dan aşağıdaki konularda yardım alınmıştır:

### 10.1 Kullanılan Alanlar

1. **NotificationService ve Email Entegrasyonu**
   - MailKit kütüphanesi entegrasyonu
   - HTML email şablonları
   - Asenkron email gönderimi

2. **Activity Log Sistemi**
   - Log servisi tasarımı
   - Enum tipleri ve modelleme

3. **Frontend UI Modernizasyonu**
   - CSS stilleri ve animasyonlar
   - Chart.js entegrasyonu
   - Responsive tasarım

4. **Rol Bazlı Filtreleme**
   - LINQ sorguları
   - Authorization mantığı

### 10.2 Öğrenilen Kavramlar

Yapay zeka yardımıyla yazılan kodlar detaylı olarak incelenmiş ve aşağıdaki kavramlar öğrenilmiştir:

- **Dependency Injection:** Servislerin constructor üzerinden enjekte edilmesi
- **Async/Await:** Asenkron programlama pattern'ı
- **Entity Framework Core:** LINQ sorguları, Include, ThenInclude
- **JWT Authentication:** Token oluşturma ve doğrulama
- **React Hooks:** useState, useEffect, useContext
- **Chart.js:** Veri görselleştirme

---

## 11. Test Senaryoları

### 11.1 Authentication Testleri

1. ✅ Yeni kullanıcı kaydı
2. ✅ Geçerli bilgilerle giriş
3. ✅ Hatalı şifre ile giriş reddi
4. ✅ Token süresi kontrolü

### 11.2 Yetkilendirme Testleri

1. ✅ Admin tüm projeleri görebilir
2. ✅ User sadece atanan görevleri görebilir
3. ✅ Yönetici görev oluşturabilir
4. ✅ User görev oluşturamaz

### 11.3 Bildirim Testleri

1. ✅ Görev atandığında bildirim oluşur
2. ✅ Email gönderimi çalışır
3. ✅ Okundu işaretleme çalışır

---

## 12. Sonuç ve Değerlendirme

### 12.1 Tamamlanan Özellikler

- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ JWT tabanlı authentication
- ✅ Rol bazlı yetkilendirme (Admin, Yönetici, User)
- ✅ Proje CRUD işlemleri
- ✅ Görev CRUD işlemleri
- ✅ Çoklu kullanıcı atama
- ✅ Bildirim sistemi
- ✅ Email entegrasyonu
- ✅ Aktivite log sistemi
- ✅ Dashboard ve istatistikler
- ✅ Takvim görünümü
- ✅ Dosya yükleme/indirme
- ✅ Modern UI tasarımı

### 12.2 Gelecek Geliştirmeler

- Real-time bildirimler (SignalR)
- Yorum sistemi
- Raporlama ve export
- Mobil uygulama
- Dark mode

### 12.3 Karşılaşılan Zorluklar

1. **Entity Framework Migration:** Circular reference sorunları
2. **JWT Token:** Rol claim'lerinin doğru eklenmesi
3. **CORS:** Frontend-backend iletişimi
4. **Email:** Gmail App Password yapılandırması

---

## 13. Kaynaklar

1. Microsoft ASP.NET Core Documentation
2. Entity Framework Core Documentation
3. React Official Documentation
4. Chart.js Documentation
5. MailKit Documentation

---

**Rapor Tarihi:** Ocak 2026  
**Geliştirici:** Arda Meydan  
**İletişim:** meydanarda71@gmail.com
