import pluginContext from '../plugin-context';

export const generatorBase64Code = (keyLength = 4) => {
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < keyLength; i++) {
    key += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return key;
};

export const generatorViewId = (views) => {
  let view_id, isUnique = false;
  while (!isUnique) {
    view_id = generatorBase64Code(4);

    // eslint-disable-next-line
    isUnique = views.every(item => {return item._id !== view_id;});
    if (isUnique) {
      break;
    }
  }
  return view_id;
};

export const getImageThumbnailUrl = (url, size) => {
  const server = pluginContext.getSetting('server');
  let isInternalLink = url.indexOf(server) > -1;
  if (isInternalLink) {
    size = size || 256;
    let imageThumbnailUrl = url.replace('/workspace', '/thumbnail/workspace') + '?size=' + size;
    return imageThumbnailUrl;
  }
  return url;
};

export const isValidEmail = (email) => {
  const reg = /^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,6}$/;

  return reg.test(email);
};

export const calculateColumns = (galleryColumnsName, currentColumns) => {
  let newColumns = [];
  galleryColumnsName.forEach(columnName => {
    let column = currentColumns.find(column => columnName === column.name);
    if (column) {
      newColumns.push(column);
    }
  });
  return newColumns;
};

export const calculateColumnsName = (currentColumns, galleryColumnsName) => {
  let newColumnsName = [];
  currentColumns.forEach(column => {
    newColumnsName.push(column.name);
  });
  if (galleryColumnsName) {
    let columnsName = Array.from(new Set([...galleryColumnsName, ...newColumnsName]));
    newColumnsName = columnsName.filter(columnName => newColumnsName.some(c => c === columnName));
  }
  return newColumnsName;
};

export const checkDesktop = () => {
  return window.innerWidth >= 768;
};

export const isTableEditable = ({permission_type = 'default', permitted_users = []}, TABLE_PERMISSION_TYPE) => {
  const { isAdmin, username } = window.dtable ? window.dtable :  window.dtablePluginConfig;

  if (!permission_type) {
    return true;
  }
  if (permission_type === TABLE_PERMISSION_TYPE.DEFAULT) {
    return true;
  }
  if (permission_type === TABLE_PERMISSION_TYPE.ADMINS && isAdmin) {
    return true;
  }
  if (permission_type === TABLE_PERMISSION_TYPE.SPECIFIC_USERS && permitted_users.includes(username)) {
    return true;
  }
  return false;
};

export const canCreateRows = (table, TABLE_PERMISSION_TYPE) => {
  let canCreateRows = true;
  if (table && table.table_permissions && table.table_permissions.add_rows_permission) {
    canCreateRows = isTableEditable(table.table_permissions.add_rows_permission, TABLE_PERMISSION_TYPE);
  }
  return canCreateRows;
};

export const needUseThumbnailImage = (url) => {
  if (!url || url.lastIndexOf('.') === -1) {
    return false;
  }
  const image_suffix = url.substr(url.lastIndexOf('.') + 1).toLowerCase();
  const suffix = ['bmp', 'tif', 'tiff'];
  return suffix.includes(image_suffix);
};
