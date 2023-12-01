const express = require("express");
const contacts = require("../../controllers/contacts");
const { validateBody, validateFavorite } = require("../../middlewares");
const { Schemas } = require("../../models/contact");
// const { validateBody } = require("../../middlewares");
// const { bodySchema } = require("../../schemas");

const router = express.Router();

router.get("/", contacts.listContacts);

router.get("/:contactId", contacts.getContactById);

router.post("/", validateBody(Schemas.bodySchema), contacts.addContact);

router.delete("/:contactId", contacts.removeContact);

router.put(
  "/:contactId",
  validateBody(Schemas.bodySchema),
  contacts.updateContact
);

router.patch(
  "/:contactId",
  validateFavorite(Schemas.favoriteSchema),
  contacts.updateStatusContact
);

module.exports = router;
