function showPage(index) {
  //handle page flipping logic
  const pages = document.querySelectorAll('.page');
  pages.forEach((page, i) => {
    page.classList.remove('active', 'exit');
    if (i === index) {
      page.classList.add('active');
    } else if (page.dataset.prevActive === "true") {
      page.classList.add('exit');
    }
    page.dataset.prevActive = (i === index);
  });

  //handle button border logic
  const buttons = document.querySelectorAll('nav button');
  buttons.forEach((btn, i) => {
    if (i === index) {
      btn.classList.add('active-btn');
    } else {
      btn.classList.remove('active-btn');
    }
  });
}

//set the first button as active on load
document.addEventListener('DOMContentLoaded', () => showPage(0));