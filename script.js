// Eksekusi pembersihan otomatis 1-KALI untuk menghapus rekam medis "wawan" layar Anda:
if (!localStorage.getItem('data_wawan_dihapus_1')) {
    localStorage.removeItem('wedding_wishes');
    localStorage.setItem('data_wawan_dihapus_1', 'true');
}

document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Open Invitation & Audio Control --- */
    const btnOpen = document.getElementById('btn-open-invitation');
    const coverOverlay = document.getElementById('cover-overlay');
    const mainContent = document.getElementById('main-content');
    const audioBtn = document.getElementById('audio-btn');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;

    // Retrieve guest name from URL if any (e.g. ?to=John+Doe)
    const urlParams = new URLSearchParams(window.location.search);
    const guestNameParam = urlParams.get('to');
    if (guestNameParam) {
        document.getElementById('guest-name').innerText = guestNameParam;
    }

    // Dev feature: Hapus data submission palsu/tes dengan menambahkan ?reset=true di URL
    if (urlParams.get('reset') === 'true') {
        localStorage.removeItem('wedding_wishes');
        window.location.href = window.location.pathname; // Hilangkan param dan refresh
    }

    btnOpen.addEventListener('click', () => {
        // Slide up cover
        coverOverlay.classList.add('slide-up');
        // Show main content
        mainContent.classList.remove('hidden-content');
        mainContent.classList.add('show-content');
        // Show audio btn
        audioBtn.classList.remove('hidden');
        
        // Play audio
        playAudio();

        // After animation completes, remove overlay from DOM flow
        setTimeout(() => {
            coverOverlay.style.display = 'none';
        }, 1000);
    });

    audioBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    });

    function playAudio() {
        // Attempt to play music (might fail if no src or browser policy)
        bgMusic.play().then(() => {
            isPlaying = true;
            audioBtn.classList.remove('paused');
        }).catch((e) => {
            console.log("Audio play prevented or no source", e);
        });
    }

    function pauseAudio() {
        bgMusic.pause();
        isPlaying = false;
        audioBtn.classList.add('paused');
    }

    /* --- 2. Countdown Timer --- */
    // Target date: 12 April 2026, 08:30:00 WIB
    const countDownDate = new Date("2026-04-12T08:30:00+07:00").getTime();

    const x = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerHTML = days < 10 ? '0' + days : days;
        document.getElementById("hours").innerHTML = hours < 10 ? '0' + hours : hours;
        document.getElementById("minutes").innerHTML = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById("seconds").innerHTML = seconds < 10 ? '0' + seconds : seconds;

        if (distance < 0) {
            clearInterval(x);
            document.getElementById("countdown").innerHTML = "<div class='time-box' style='width:auto;padding:10px 20px;'><span>Acara Telah Dimulai</span></div>";
        }
    }, 1000);

    /* --- 3. Scroll Animations (Intersection Observer) --- */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => observer.observe(el));

    /* --- 4. Form RSVP Logic (Local Storage) --- */
    const wishForm = document.getElementById('wish-form');
    const wishesList = document.getElementById('wishes-list');
    
    // Load from local storage
    const loadWishes = () => {
        const wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [];
        wishesList.innerHTML = '';
        if(wishes.length === 0) {
            wishesList.innerHTML = '<p class="wish-item" style="text-align:center;color:var(--text-muted);border:none;">Jadilah yang pertama memberikan ucapan bahagia!</p>';
        } else {
            wishes.forEach(wish => {
                const badgeClass = wish.attendance === 'Hadir' ? 'hadir' : 'tidak';
                const html = `
                    <div class="wish-item">
                        <div class="wish-name">
                            ${wish.name}
                            <span class="badge ${badgeClass}"><i class="fas fa-check-circle"></i> ${wish.attendance}</span>
                        </div>
                        <div class="wish-time">${wish.date}</div>
                        <div class="wish-text">${wish.message}</div>
                    </div>
                `;
                wishesList.insertAdjacentHTML('beforeend', html);
            });
        }
    };

    loadWishes();

    wishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = wishForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
        submitBtn.disabled = true;

        const name = document.getElementById('name').value;
        const attendance = document.getElementById('attendance').value;
        const message = document.getElementById('message').value;
        
        // 1. Simpan ke Local Storage (Tampilan di Web)
        const newWish = {
            name: name,
            attendance: attendance,
            message: message,
            date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
        
        const wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [];
        wishes.unshift(newWish); // add to top
        localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
        
        // 2. Kirim secara otomatis ke Email via FormSubmit
        // GANTI INI: Ubah 'email_anda@gmail.com' dengan alamat email penerima notifikasi Anda.
        const emailTujuan = "defgamer276@gmail.com"; 
        const formSubmitUrl = `https://formsubmit.co/ajax/${emailTujuan}`;

        fetch(formSubmitUrl, {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `💌 RSVP Undangan: ${name} (${attendance})`,
                Nama: name,
                Kehadiran: attendance,
                Pesan_dan_Doa: message
            })
        })
        .then(response => response.json())
        .then(data => {
            wishForm.reset();
            loadWishes();
            showToast("Ucapan berhasil dikirim ke email!");
        })
        .catch(error => {
            console.error("Gagal mengirim email: ", error);
            // Tetap jalankan update UI jika email error (karena misal adblock dsb)
            wishForm.reset();
            loadWishes();
            showToast("Ucapan berhasil disampaikan!");
        })
        .finally(() => {
            // Kembalikan tombol ke bentuk semula
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    });

});

/* --- 5. Copy Text Utility --- */
function copyText(text) {
    navigator.clipboard.writeText(text).then(function() {
        showToast("Nomor rekening berhasil disalin");
    }, function(err) {
        showToast("Gagal menyalin text");
        console.error('Async: Could not copy text: ', err);
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");
    
    setTimeout(function(){ 
        toast.classList.remove("show"); 
    }, 3000);
}
