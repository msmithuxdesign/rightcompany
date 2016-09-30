import { DATA_UPDATED } from '../Constants/actionTypes';

export function dataUpdated(category, value) {
    return { type: DATA_UPDATED, catChanged: category, value: value};
}
