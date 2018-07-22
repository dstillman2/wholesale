import { badge } from '../../components/widgets/badge';

import {
  ajaxFetchUser,
  ajaxUpdateUser,
  updateUserData,
  forceUpdateUserProps,
} from '../../actions/user.actions';

const configs = {
  title: 'User Info',
  store: 'user',
  ajax: {
    fetch: ajaxFetchUser,
    update: ajaxUpdateUser,
    updateDataInStore: updateUserData,
    forceUpdateProps: forceUpdateUserProps,
  },
  fields: [
    [
      {
        ref: 'first_name',
        label: 'First Name',
        type: 'text',
        placeholder: 'First Name',
        defaultStaticText: badge('N/A'),
        size: 6,
        errorName: 'First Name',
        isRequired: true,
      },
      {
        ref: 'last_name',
        label: 'Last Name',
        type: 'text',
        placeholder: 'Last Name',
        defaultStaticText: badge('N/A'),
        size: 6,
        errorName: 'Last Name',
        isRequired: true,
      },
    ],
  ],
};

export default configs;
