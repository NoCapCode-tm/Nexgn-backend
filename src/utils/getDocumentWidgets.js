import {
    documentfield
} from "../models/documentfield.models.js";

import {
    templatewidget
} from "../models/templatewidget.models.js";


export const getDocumentWidgets = async (
    document
) => {

    /*
     * Direct uploaded PDF
     */
    if (document.driveFileId) {

        const fields =
            await documentfield.findOne({
                documentId:
                    document._id
            }).lean();

        return fields?.widget || [];
    }


    /*
     * Template PDF / template HTML
     */
    if (document.templateId) {

        const fields =
            await templatewidget.findOne({
                templateid:
                    document.templateId._id
            }).lean();

        return fields?.widget || [];
    }


    return [];
};