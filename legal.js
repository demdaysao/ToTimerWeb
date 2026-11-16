/* Trang pháp lý: đổi ngôn ngữ VI/EN + chế độ tối, dùng CÙNG khoá localStorage với trang chủ (timer:lang, timer:theme). */
(function () {
  var root = document.documentElement;
  function setLang(l) {
    root.setAttribute('lang', l);
    try { localStorage.setItem('timer:lang', l); } catch (e) {}
    document.querySelectorAll('.nav__tg-btn--lang').forEach(function (b) {
      b.classList.toggle('nav__tg-btn--active', b.getAttribute('data-lang') === l);
    });
    var title = document.documentElement.getAttribute('data-title-' + l);
    if (title) document.title = title;
  }
  document.querySelectorAll('.nav__tg-btn--lang').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  setLang(root.getAttribute('lang') === 'en' ? 'en' : 'vi');

  var themeBtn = document.getElementById('themeToggle');
  function paint() { themeBtn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀' : '☾'; }
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('timer:theme', next); } catch (e) {}
    paint();
  });
  paint();
})();
