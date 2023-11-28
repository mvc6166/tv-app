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
      <h2>${this.name}</h2>

      <div class="bigcols">
        <div class="lecture-screen">
          <video-player source="https://www.youtube.com/watch?v=eC7xzavzEKY"></video-player>
        </div>
    
        <div class="lecture-slide-list">
          ${
            this.listings.map(
              (item) => html`
                <lecture-slide 
                  title="${item.title}"
                  presenter="${item.metadata.author}"
                  @click="${this.itemClick}"
                >
                </lecture-slide>
              `
            )
          }
        </div>
      </div>

      
      <div>
        <!-- video -->
        <!-- discord / chat - optional -->
      </div>
      <!-- dialog SHOWS WHEN CLICK -->
      <sl-dialog label="Dialog" class="dialog">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <sl-button slot="footer" variant="primary" @click="${this.closeDialog}">Close</sl-button>
      </sl-dialog>
    `;
  }

  closeDialog(e) {
    const dialog = this.shadowRoot.querySelector('.dialog');
    dialog.hide();
  }

  itemClick(e) {
    console.log(e.target);
    const dialog = this.shadowRoot.querySelector('.dialog');
    dialog.show();
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
