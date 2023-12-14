// import stuff
import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import "./lecture-slide.js";
import '@lrnwebcomponents/video-player/video-player.js';

export class LecturePlayer extends LitElement {
  // defaults
  constructor() {
    super();
    this.name = '';
    this.source = new URL('../assets/slides.json', import.meta.url).href;
    this.listings = [];
    this.slideDescription = '';
  }
  // convention I enjoy using to define the tag's name
  static get tag() {
    return 'lecture-player';
  }
  // LitElement convention so we update render() when values change
  static get properties() {
    return {
      name: { type: String },
      source: { type: String },
      listings: { type: Array },
      slideDescription: { type: String },
    };
  }
  // LitElement convention for applying styles JUST to our element
  static get styles() {
    return [
      css`
      :host {
        display: block;
        margin: 16px;
        padding: 16px;
      }

      .bigcols {
        display: grid;
        grid-template-columns: 2.5fr 1fr;
        grid-template-rows: 1fr;
        grid-column-gap: 32px;
        grid-row-gap: 0px;
      }

      .button-holder {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: 1fr;
        grid-column-gap: 0px;
        grid-row-gap: 0px;
      }

      .button-previous {
        background-color: black;
        color: white;
        text-align: center;
        padding: 8px;
      }

      .button-next {
        background-color: black;
        color: white;
        text-align: center;
        padding: 8px;
      }

      .description-holder {
        display: flex;
        background-color: lightgray;
        align-items: center;
        height: 10vh
      }

      .lecture-screen {
        background-color: darkgray;
        align-items: center;
        padding: 8px;
      }

      .lecture-slide-list {
        display: flex;
        flex-direction: column; /* infinite rows */
        background-color: darkgray;
        align-items: center;
        padding: 16px;
        gap: 16px;

        overflow-y: scroll;
        height: 90vh;
      }
      `
    ];
  }
  // LitElement rendering template of your element
  render() {
    return html`
      <div class="bigcols">

        <div class="leftside">
          <div class="lecture-screen">
            <video-player source="https://www.youtube.com/watch?v=eC7xzavzEKY"></video-player>
          </div>

          <div class="description-holder" desc="${this.updatingDescription}" @click="${this.getDescription}">${this.slideDescription}</div>
          
          <div class="button-holder">
              <div class="button-previous" @click="${this.prevSlide}">Previous Slide</div>
              <div></div>
              <div class="button-next" @click="${this.nextSlide}">Next Slide</div>
          </div>
        </div>

        <div class="lecture-slide-list">
          ${
            this.listings.map( 
              (item) => html` <!-- dialog SHOWS WHEN CLICK -->
                <lecture-slide 
                  title="${item.title}"
                  description="${item.description}"
                  timecode="${item.metadata.timecode}"
                  @click="${this.itemClick}"
                >
                </lecture-slide>
              `
            )
          }
        </div>

      </div>
    `;
  }

  itemClick(e) {
    this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').play();
    this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').seek(e.target.timecode);
  }

  nextSlide() {
    const currentVidTime = this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').media.currentTime;
    
    const nextTime = this.listings.find((item) => currentVidTime < item.metadata.timecode);
    
    this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').play();
    this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').seek(nextTime.metadata.timecode);
  }

  prevSlide() {
    const currentVidTime = this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').media.currentTime;
    
    const currentSlideStart = this.listings.findLast((item) => item.metadata.timecode < currentVidTime);
    const prevSlideStart = this.listings.findLast((item) => item.metadata.timecode < currentSlideStart.metadata.timecode);

    this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').play();
    this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').seek(prevSlideStart.metadata.timecode);
  }

  updatingDescription() { //procs every 2 seconds
    setInterval(this.getDescription, 2000);
  }

  getDescription() { //CHECKING CURRENT TIMESTAMP AND IF IT PASSES A BOUNDARY THEN UPDATING THE DESCRIPTION BOX
      const currentVidTime = this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').media.currentTime;
      const currentSlideStart = this.listings.findLast((item) => item.metadata.timecode < currentVidTime);
      
      console.log(currentSlideStart.description); //for testing
      
      //this.querySelector('description-holder').words = currentSlideStart.description;

      this.slideDescription = currentSlideStart.description; //this works for clicking to get description
  }

  // LitElement life cycle for when any property changes
  updated(changedProperties) {
    if (super.updated) {
      super.updated(changedProperties);
    }
    changedProperties.forEach((oldValue, propName) => {
      if (propName === "source" && this[propName]) {
        this.updateSourceData(this[propName]);
      }
    });
  }

  async updateSourceData(source) {
    await fetch(source).then((resp) => resp.ok ? resp.json() : []).then((responseData) => {
      if (responseData.status === 200 && responseData.data.items && responseData.data.items.length > 0) {
        this.listings = [...responseData.data.items];
      }
    });
  }
}
// tell the browser about our tag and class it should run when it sees it
customElements.define(LecturePlayer.tag, LecturePlayer);
