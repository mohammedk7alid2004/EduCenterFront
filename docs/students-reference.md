# Students reference

Design: [Final Screen](https://www.figma.com/design/zkKQ0DmCIkniHJGzwj36EH/Untitled?node-id=122-23969).
Student frames: List `416:66356`, Add `416:66853`, Edit `416:67447`, View `416:68034`.
The user supplied matching `students- List.png`, `students- Add.png`, `students- Edit.png`, and `students- View.png` screenshots and authorized implementing from them.

Students appears immediately after Schedule Management. Forms use dependent education level / grade selectors. Password and confirmation are required when creating the backing student account; editing without a password preserves the current one.

API: `/api/v1/Students` (GET, POST, PUT, DELETE), `/{id}` (GET), `/toggle-status/{id}` (PATCH). The current backend returns empty subjects/groups and null fees until enrollment and billing are connected. Display those actual empty states, without inferred payment or enrollment data.
