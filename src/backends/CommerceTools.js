import SdkAuth from '@commercetools/sdk-auth'
import {ProductSelectorError} from '../ProductSelectorError';
import qs from 'qs';

export class CommerceTools {
  constructor({host, projectKey, clientId, clientSecret, apiUrl, scope = 'view_published_products', locale}) {

    this.sdkAuth = new SdkAuth({
      host,
      projectKey,
      disableRefreshToken: false,
      credentials: {
        clientId,
        clientSecret,
      },
      scopes: [scope + ':' + projectKey],
    });

    this.apiUrl = apiUrl;
    this.locale = locale;
  }

  async getHeaders() {
    this.token = await this.sdkAuth.clientCredentialsFlow();
    const {
      token_type, access_token
    } = this.token;

    return {
      headers: {
        'Authorization': `${token_type} ${access_token}`
      }
    };
  }

  async getItems(state, filterIds = []) {
    const {
      PAGE_SIZE,
      params: {
        projectKey
      }
    } = state;
    try {
      if (!filterIds.length){
        return [];
      }
      
      console.log('getItems', filterIds);
      const headers = await this.getHeaders();
      const idsStrings = '"' + filterIds.join('","') + '"';

      const params = {
        method: 'GET',
        ...headers
      };

      console.log('getItems-ids', idsStrings);
      const queryString = qs.stringify(
        {
          staged: false,
          limit: PAGE_SIZE,
          where: `key in (${idsStrings})`
        }
      );

      console.log('getItems-queryString', queryString)
      
      const response = await fetch(`${this.apiUrl}/${projectKey}/product-projections?${queryString}`, params);
      const {results} = await response.json();

      console.log('getItems-results', results)
      return this.parseResults(results);

    } catch (e) {
      console.error(e);
      throw new ProductSelectorError('Could not get items', ProductSelectorError.codes.GET_SELECTED_ITEMS);
    }
  }

  getImage({ attributes = [], images = [] }) {
    const LARGE_IMAGE_KEY = 'largeImageUrl';
    const largeImage = attributes.find(({ name = '' }) => name === LARGE_IMAGE_KEY);

    if (largeImage && largeImage.value) {
      return largeImage.value;
    }

    return images.length ? images[0].url : '';
  }

  parseResults(data) {
    return data.map((item) => {
      console.log('parseResults-item', item)

      return {
        id: item.id,
        key: item.key, 
        name: item.name[this.locale],
        image: this.getImage(item.masterVariant)
      }
    })
  }

  async search(state) {
    const {
      searchText,
      page,
      PAGE_SIZE,
      params: {projectKey}
    } = state;

    try {
      const headers = await this.getHeaders();

      const params = {
        method: 'GET',
        ...headers
      };

      const queryString = qs.stringify(
        {
          staged: false,
          offset: page.curPage * PAGE_SIZE,
          limit: PAGE_SIZE,
          [`text.${this.locale}`]: searchText
        }
      );

      const response = await fetch(`${this.apiUrl}/${projectKey}/product-projections/search?${queryString}`, params);
      const {results, total} = await response.json();

      return {
        items: this.parseResults(results),
        page: {
          numPages: Math.ceil(total / PAGE_SIZE),
          curPage: page.curPage,
          total
        }
      };
    } catch (e) {
      console.error(e);
      throw new ProductSelectorError('Could not search', ProductSelectorError.codes.GET_ITEMS);
    }
  }

  exportItem(item) {
    console.log('exportItem-item', item)
    return item.key;
  }
}
