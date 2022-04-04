class SliderComponent extends HTMLElement {
    constructor() {
      super();
      this.slider = this.querySelector('ul');
      this.sliderItems = this.querySelectorAll('li');
      this.pageCount = this.querySelector('.slider-counter--current');
      this.pageTotal = this.querySelector('.slider-counter--total');
      this.prevButton = this.querySelector('button[name="previous"]');
      this.nextButton = this.querySelector('button[name="next"]');
  
      if (!this.slider || !this.nextButton) return;
  
      const resizeObserver = new ResizeObserver(entries => this.initPages());
      resizeObserver.observe(this.slider);
  
      this.slider.addEventListener('scroll', this.update.bind(this));
      this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
      this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
    }
  
    initPages() {
      const sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
      this.sliderLastItem = sliderItemsToShow[sliderItemsToShow.length - 1];
      if (sliderItemsToShow.length === 0) return;
      this.slidesPerPage = Math.floor(this.slider.clientWidth / sliderItemsToShow[0].clientWidth);
      this.totalPages = sliderItemsToShow.length - this.slidesPerPage + 1;
      this.update();
    }
  
    update() {
      if (!this.pageCount || !this.pageTotal) return;
      this.currentPage = Math.round(this.slider.scrollLeft / this.sliderLastItem.clientWidth) + 1;
  
      if (this.currentPage === 1) {
        this.prevButton.setAttribute('disabled', true);
      } else {
        this.prevButton.removeAttribute('disabled');
      }
  
      if (this.currentPage === this.totalPages) {
        this.nextButton.setAttribute('disabled', true);
      } else {
        this.nextButton.removeAttribute('disabled');
      }
  
      this.pageCount.textContent = this.currentPage;
      this.pageTotal.textContent = this.totalPages;
    }
  
    onButtonClick(event) {
      event.preventDefault();
      const slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + this.sliderLastItem.clientWidth : this.slider.scrollLeft - this.sliderLastItem.clientWidth;
      this.slider.scrollTo({
        left: slideScrollPosition
      });
    }
  }
  
  customElements.define('slider-component', SliderComponent);