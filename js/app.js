const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const iconSun = document.getElementById('icon-sun');
const iconMoon = document.getElementById('icon-moon');
const postsGrid = document.getElementById('postsGrid');
const postsCount = document.getElementById('postsCount');
const emptyHint = document.getElementById('emptyHint');
const formArea = document.getElementById('formArea');
const openAdd = document.getElementById('openAdd');
const savePost = document.getElementById('savePost');
const cancelPost = document.getElementById('cancelPost');
const titleInp = document.getElementById('titleInp');
const contentInp = document.getElementById('contentInp');
const thumbInp = document.getElementById('thumbInp');
const yearEl = document.getElementById('year');

// sample starter posts
const starter = [
  {
    title: "Membangun UI modern",
    thumb: "https://images.unsplash.com/photo-1509228627159-645c3ea4f6a1?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Panduan ringkas membangun antarmuka yang bersih dan responsif.",
    date: new Date().toLocaleDateString()
  },
  {
    title: "Kenapa mode gelap penting?",
    thumb: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Pertimbangan ergonomi dan tampilan modern untuk pengguna malam hari.",
    date: new Date().toLocaleDateString()
  }
];

// Theme toggle
function setTheme(dark){
  if(dark){
    body.classList.add('dark');
    themeToggle.setAttribute('aria-pressed','true');
    iconMoon.style.display = 'none';
    iconSun.style.display = 'inline-block';
  } else {
    body.classList.remove('dark');
    themeToggle.setAttribute('aria-pressed','false');
    iconMoon.style.display = 'inline-block';
    iconSun.style.display = 'none';
  }
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

(function initTheme(){
  const saved = localStorage.getItem('theme');
  if(saved){
    setTheme(saved === 'dark');
  } else {
    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(preferDark);
  }
})();
themeToggle.addEventListener('click', () => {
  setTheme(!body.classList.contains('dark'));
});

// Posts
function getPosts(){
  try {
    return JSON.parse(localStorage.getItem('posts') || 'null') || starter;
  } catch(e){
    return starter;
  }
}
function savePosts(arr){
  localStorage.setItem('posts', JSON.stringify(arr));
}
function renderPosts(){
  const posts = getPosts();
  postsGrid.innerHTML = '';
  postsCount.textContent = posts.length ? `(${posts.length})` : '';
  emptyHint.style.display = posts.length === 0 ? 'block' : 'none';

  posts.forEach((p, idx) => {
    const el = document.createElement('div');
    el.className = 'post card';
    el.innerHTML = `
      <div class="post-thumb" style="background-image:url('${p.thumb || 'https://via.placeholder.com/400x200'}')"></div>
      <div class="post-body">
        <h4 class="post-title">${escapeHtml(p.title)}</h4>
        <div class="meta">${escapeHtml(p.date || '')}</div>
        <div class="muted">${escapeHtml(p.excerpt || p.content || '').slice(0,160)}${(p.excerpt||p.content||'').length>160?'...':''}</div>
        <div class="post-actions">
          <button class="btn" onclick="viewPost(${idx})">Baca</button>
          <button class="btn" onclick="sharePost(${idx})">Bagikan</button>
          <button class="btn delete" onclick="deletePost(${idx})" title="Hapus posting">Hapus</button>
        </div>
      </div>
    `;
    postsGrid.appendChild(el);
  });
}
function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) }
window.viewPost = function(i){
  const p = getPosts()[i];
  if(!p) return alert('Posting tidak ditemukan');
  alert(`${p.title}\n\n${(p.content || p.excerpt || '').slice(0,1000)}`);
}
window.sharePost = function(i){
  const p = getPosts()[i];
  if(!p) return;
  if(navigator.share){
    navigator.share({title:p.title,text:p.excerpt || p.content || '',url:location.href})
      .catch(()=>alert('Gagal berbagi'));
  } else {
    prompt('Salin teks berikut untuk dibagikan:', p.title + "\n\n" + (p.excerpt||p.content||''));
  }
}
window.deletePost = function(i){
  if(!confirm('Yakin ingin menghapus posting ini?')) return;
  const posts = getPosts();
  posts.splice(i,1);
  savePosts(posts);
  renderPosts();
}

// Add post form
openAdd.addEventListener('click', () => {
  formArea.style.display = formArea.style.display === 'none' ? 'block' : 'none';
  titleInp.focus();
});
cancelPost.addEventListener('click', () => {
  formArea.style.display = 'none';
  titleInp.value = thumbInp.value = contentInp.value = '';
});
savePost.addEventListener('click', () => {
  const title = titleInp.value.trim();
  const content = contentInp.value.trim();
  const thumb = thumbInp.value.trim();
  if(!title || !content){ alert('Isi judul dan konten terlebih dahulu'); return; }
  const posts = getPosts();
  posts.unshift({
    title,
    content,
    excerpt: content.slice(0,160),
    thumb: thumb || '',
    date: new Date().toLocaleDateString()
  });
  savePosts(posts);
  titleInp.value = thumbInp.value = contentInp.value = '';
  formArea.style.display = 'none';
  renderPosts();
});

// CTA
document.getElementById('sampleCTa').addEventListener('click', () => {
  alert('Ini demo statis. Coba tombol "Tambah Postingan" untuk membuat posting baru.');
});

// Footer year
yearEl.textContent = new Date().getFullYear();

// Initial render
renderPosts();
