/* eslint-disable no-continue */

import { ENTITY } from "@butlerhospitality/shared";

export const parseCategories = (data: any) => {
  const categories = {};

  for (let i = 0; i < data.length; i += 1) {
    const categoryID = data[i].category.parent_category?.id;
    const subcategoryID = data[i].category.id;
    const itemID = data[i].product.id;
    const productName = data[i].product?.name;
    const basePrice = data[i].product?.price;
    const image = data[i].product?.image;
    const imageBaseUrl = data[i].product?.image_base_url;

    const { product, menu, ...otherData } = data[i];

    if (!categories[categoryID]?.subcategories) {
      if (!categories[categoryID]?.subcategories[subcategoryID]) {
        if (!categories[categoryID]?.subcategories[subcategoryID]?.items) {
          categories[categoryID] = {
            name: otherData.category.parent_category?.name,
            subcategories: {
              ...categories[categoryID]?.subcategories,
              [subcategoryID]: {
                name: otherData.category.name,
                sort_order: otherData.sort_order,
                items: {
                  ...categories[categoryID]?.subcategories[subcategoryID]?.items,
                  [itemID]: {
                    ...otherData,
                    id: itemID,
                    modifiers: product.modifiers || [],
                    base_price: basePrice,
                    name: productName,
                    image,
                    image_base_url: imageBaseUrl
                  }
                }
              }
            }
          };
        } else {
          categories[categoryID].subcategories[subcategoryID].items = {
            ...categories[categoryID].subcategories[subcategoryID].items,
            [itemID]: {
              ...otherData,
              id: itemID,
              modifiers: product.modifiers || [],
              base_price: basePrice,
              name: productName,
              image,
              image_base_url: imageBaseUrl
            }
          };
        }
      } else {
        categories[categoryID].subcategories[subcategoryID].items = {
          ...categories[categoryID].subcategories[subcategoryID].items,
          [itemID]: {
            ...otherData,
            id: itemID,
            modifiers: product.modifiers || [],
            base_price: basePrice,
            name: productName,
            image,
            image_base_url: imageBaseUrl
          }
        };
      }
    } else if (otherData.category.id) {
      categories[categoryID].subcategories = {
        ...categories[categoryID].subcategories,
        [subcategoryID]: {
          name: otherData.category.name,
          sort_order: otherData.sort_order,
          items: {
            ...categories[categoryID].subcategories[subcategoryID]?.items,
            [itemID]: {
              ...otherData,
              id: itemID,
              modifiers: product.modifiers || [],
              base_price: basePrice,
              name: productName,
              image,
              image_base_url: imageBaseUrl
            }
          }
        }
      };
    }
  }

  return categories;
};

export const parseCategorizedItems = (data: any) => {
  const categories = {};

  for (let i = 0; i < data.length; i += 1) {
    const category = data[i];
    if (!category.subcategories.getItems().length) {
      continue;
    }

    const subCategories = {};

    category.subcategories.getItems().forEach((subCategory: any) => {
      if (subCategory.items?.getItems().length) {
        subCategories[subCategory.id] = {
          name: subCategory.name,
          start_time: subCategory.start_time,
          end_time: subCategory.end_time,
          items: subCategory.items?.getItems().filter((item) => item.is_active)
        };
      }
    });

    if (Object.keys(subCategories).length) {
      categories[category.id] = {
        name: category.name,
        start_time: category.start_time,
        end_time: category.end_time,
        subcategories: subCategories
      };
    }
  }
  return categories;
};

const WEB_MENU_GENERATION_URLS = {
  dev: process.env.GENERATE_WEB_MENU_DEV,
  qa: process.env.GENERATE_WEB_MENU_QA,
  prod: process.env.GENERATE_WEB_MENU_PROD
};

export const getWebMenuGenerationUrl = (stage: string) => {
  return WEB_MENU_GENERATION_URLS[stage];
};

export const eventDataDeleteCategory = (category, id) => {
  const menus = [];
  let items = [];
  let subcategories = [];
  let eventData = [];
  if (!category.parent_category) {
    category.subcategories.toArray().forEach((element) => {
      element.menuProducts.forEach((el) => {
        if (!menus.find((data) => data.id == el.menu)) {
          menus.push({
            id: el.menu,
            entity: ENTITY.MENU.MENU
          });
        }
      });
      element.items.forEach((item) => {
        if (!items.find((data) => data.id == item.id)) {
          items.push({
            id: item.id,
            entity: ENTITY.MENU.PRODUCT
          });
        }
      });
      subcategories.push({
        id: element.id,
        entity: ENTITY.MENU.CATEGORY
      });
    });
  } else {
    category.menuProducts.toArray().forEach((element) => {
      if (!menus.find((data) => data.id == element.menu)) {
        menus.push({
          id: element.menu,
          entity: ENTITY.MENU.MENU
        });
      }
    });
    items = category.items.toArray().map((el) => {
      return {
        id: el.id,
        entity: ENTITY.MENU.PRODUCT
      };
    });

    subcategories = category.subcategories.toArray().map((el) => {
      return {
        id: el.id,
        entity: ENTITY.MENU.CATEGORY
      };
    });
  }

  eventData = eventData.concat(menus, items, subcategories);
  eventData.push({
    id,
    entity: ENTITY.MENU.CATEGORY
  });

  return eventData;
};
