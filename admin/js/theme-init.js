// Global Localization Config
window.I18N = {
    common: {
        success: "Başarılı",
        error: "Hata",
        warning: "Uyarı",
        info: "Bilgi",
        save: "Kaydet",
        cancel: "İptal",
        add: "Ekle",
        delete: "Sil",
        edit: "Düzenle",
        ok: "Tamam",
        yesDelete: "Evet, Sil",
        confirm: "Onayla",
        giveUp: "Vazgeç"
    },
    ui: {
        saved: "Kaydedildi!",
        changesSaved: "Değişiklikler kaydedildi.",
        statusUpdated: "Durum Güncellendi",
        draftMode: "Öğe taslak moda alındı.",
        activeMode: "Öğe yayına alındı.",
        actionStarted: "İşlem Başlatıldı",
        loadingMenu: "Hızlı işlem menüsü yükleniyor...",
        deleteTitle: "Silme İşlemi",
        deleteConfirm: "Bu öğeyi silmek istediğinizden emin misiniz? <br><small>Bu işlem geri alınabilir (soft delete).</small>",
        itemDeleted: "Öğe silindi (Arşivlendi).",
        deleted: "Silindi",
        restoreTitle: "Geri Yükle",
        restoreConfirm: "Bu bildirimi geri yüklemek istiyor musunuz?",
        itemRestored: "Bildirim geri yüklendi.",
        notificationRestored: "Bildirim geri yüklendi.",
        markRead: "Okundu İşaretle",
        readSuccess: "Bildirim okundu olarak işaretlendi.",
        approved: "Onaylandı",
        approveSuccess: "İçerik başarıyla onaylandı.",
        active: "Aktif",
        passive: "Pasif"
    },
    pages: {
        addLink: "Link Ekle",
        addImage: "Resim Ekle",
        addVideo: "Video Ekle",
        addCode: "Kod Bloğu Ekle",
        selectEmoji: "Emoji Seç",
        coverImage: "Kapak Görseli",
        clear: "Temizle",
        clearConfirm: "Editördeki tüm içeriği silmek istediğinize emin misiniz?",
        enterImgUrl: "Lütfen bir resim URL'si girin.",
        pasteCode: "Kodunuzu buraya yapıştırın..."
    },
    auth: {
        loginSuccess: "Giriş Başarılı",
        redirecting: "Yönlendiriliyorsunuz...",
        fillAll: "Lütfen tüm alanları doldurun."
    },
    notifications: {
        allRead: "Tüm bildirimler okundu olarak işaretlendi."
    }
};

(function () {
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-mode');
    }
})();
