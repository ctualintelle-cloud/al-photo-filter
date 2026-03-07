document.addEventListener('DOMContentLoaded', () => {
    // --- متغيرات الـ DOM ---
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    const uploadContent = document.querySelector('.upload-content');
    const filterCards = document.querySelectorAll('.filter-card');
    const generateBtn = document.getElementById('generateBtn');
    const creditsCountEl = document.getElementById('creditsCount');
    const loadingOverlay = document.getElementById('loadingOverlay');

    const resultModal = document.getElementById('resultModal');
    const resultImage = document.getElementById('resultImage');
    const closeModal = document.getElementById('closeModal');
    const downloadBtn = document.getElementById('downloadBtn');
    const tryAgainBtn = document.getElementById('tryAgainBtn');

    const premiumModal = document.getElementById('premiumModal');
    const closePremium = document.getElementById('closePremium');

    const hfTokenInput = document.getElementById('hfToken');

    // --- حالة التطبيق ---
    let selectedFile = null;
    let selectedFilter = 'cartoon'; // الفلتر الافتراضي
    let isPremiumSelected = false;

    // --- نظام الرصيد (الرصيد المجاني 3) ---
    let credits = localStorage.getItem('al_photo_credits');
    if (credits === null) {
        credits = 3;
        localStorage.setItem('al_photo_credits', credits);
    }
    creditsCountEl.innerText = credits;

    // استعادة مفتاح API إن وجد
    const savedToken = localStorage.getItem('hf_token');
    if (savedToken) {
        hfTokenInput.value = savedToken;
    }

    // --- رفع الصورة ---
    uploadArea.addEventListener('click', () => fileInput.click());

    // Drag and Drop Events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // File Input Event
    fileInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            handleFile(this.files[0]);
        }
    });

    function handleFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert('الرجاء رفع صورة بصيغة JPG أو PNG فقط.');
            return;
        }

        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            uploadContent.style.display = 'none';
            checkGenerateStatus();
        };
        reader.readAsDataURL(file);
    }

    // --- اختيار الفلتر ---
    filterCards.forEach(card => {
        card.addEventListener('click', () => {
            // إزالة التفعيل من البقية
            filterCards.forEach(c => c.classList.remove('active'));
            // تفعيل الكارد الحالي
            card.classList.add('active');
            selectedFilter = card.dataset.filter;
            isPremiumSelected = card.classList.contains('premium');

            checkGenerateStatus();
        });
    });

    // --- تفعيل الزر ---
    function checkGenerateStatus() {
        if (selectedFile) {
            generateBtn.removeAttribute('disabled');
        } else {
            generateBtn.setAttribute('disabled', 'true');
        }
    }

    // --- حفظ التوكن من المطور ---
    window.saveToken = function () {
        const token = hfTokenInput.value.trim();
        if (token) {
            localStorage.setItem('hf_token', token);
            alert('تم حفظ مفتاح API بنجاح!');
        } else {
            localStorage.removeItem('hf_token');
            alert('تم مسح مفتاح API.');
        }
    };

    // --- توليد الصورة ---
    generateBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        // التحقق من الفلتر المدفوع والرصيد
        if (isPremiumSelected || credits <= 0) {
            premiumModal.style.display = 'flex';
            return;
        }

        // إظهار التحميل
        loadingOverlay.style.display = 'flex';

        // محاولة المعالجة بالذكاء الاصطناعي (حقيقي أو وهمي)
        try {
            await processImage();

            // خصم رصيد (فقط في حال لم يكن المدفوع ولم يكن هناك خطأ)
            credits--;
            localStorage.setItem('al_photo_credits', credits);
            creditsCountEl.innerText = credits;

            // إخفاء التحميل وإظهار النتيجة
            loadingOverlay.style.display = 'none';
            resultModal.style.display = 'flex';

        } catch (error) {
            loadingOverlay.style.display = 'none';
            alert('حدث خطأ أثناء معالجة الصورة: ' + error.message);
        }
    });

    // العملية لمحاكاة الـ API أو استخدام HF حقيقي
    async function processImage() {
        const token = localStorage.getItem('hf_token');

        // إذا كان هناك توكن حقيقي (للنسخة العملية)
        if (token && token.startsWith('hf_')) {
            // هنا يوضع كود الاستدعاء الفعلي لنماذج Hugging Face
            // للمثال فقط، سنستخدم تأخير زمني لمعالجة نموذجية، لأن ربط الموديل الحقيقي يحتاج تحديد الموديل (مثل SDXL-Turbo) 
            // وتحويل الصورة لـ Base64 وإرسالها
            await new Promise(resolve => setTimeout(resolve, 3000));

            // في الواقع، النتيجة ستكون (Blob)
            // سنستعير صورة من مكان لتجسيد الفكرة بنجاح:
            resultImage.src = generateMockResult();
            downloadBtn.href = resultImage.src;
        }
        else {
            // محاكاة (Simulation) للمبتدئين بدون حساب API
            // نأخذ 3 ثواني للإيحاء بالمعالجة
            await new Promise(resolve => setTimeout(resolve, 3000));

            // إنشاء نتيجة مبنية على الصورة الأصلية (في الواقع سيحتاج API)
            // نستخدم صورة وهمية لتوصيل الفكرة في النسخة التجريبية للمستخدم
            resultImage.src = generateMockResult();
            downloadBtn.href = resultImage.src;
        }
    }

    function generateMockResult() {
        // بما أن الذكاء الاصطناعي يحتاج خوادم، سنعرض صورة توضيحية حسب الفلتر
        // إذا كان التطبيق حقيقيا سيتم استبدال هذه بـ URL الصورة المراجعة من الـ API
        if (selectedFilter === 'cartoon') {
            return `https://picsum.photos/seed/${Math.random()}/500/500?grayscale&blur=2`; // مجرد مثال مقارب
        } else if (selectedFilter === '3d') {
            return `https://picsum.photos/seed/${Math.random()}/500/500?blur=1`; // مجرد مثال
        } else {
            return `https://picsum.photos/seed/${Math.random()}/500/500`;
        }
    }

    // --- إغلاق النوافذ المنبثقة ---
    closeModal.addEventListener('click', () => { resultModal.style.display = 'none'; });
    tryAgainBtn.addEventListener('click', () => {
        resultModal.style.display = 'none';
        // مسح الصورة
        selectedFile = null;
        imagePreview.style.display = 'none';
        imagePreview.src = '';
        uploadContent.style.display = 'block';
        checkGenerateStatus();
    });

    closePremium.addEventListener('click', () => { premiumModal.style.display = 'none'; });

    window.onclick = function (event) {
        if (event.target == resultModal) resultModal.style.display = "none";
        if (event.target == premiumModal) premiumModal.style.display = "none";
    }
});
