# TODO

See [ANOMALIES.md](ANOMALIES.md) for anomaly checking TODOs.

- [ ] the `contents` page for an exam should not be accessible by any means unless the exam is being loaded into the `show` page. (`exams_controller.rb:36`)
  - [ ] encrypt the data on the `contents` page
  - [ ] client side decryption with PIN
  - [ ] login counter, so that PIN changes
- [ ] 6-digit PINs for students to check-in to exams based on exam salt and username
- [ ] notion of exam rooms
  - [ ] professor chooses the room they are in
- [ ] a way to check if students disconnect from the internet
  - [ ] show active sessions, if one is dropped, make an anomaly
- [ ] double check permissions for every controller action
  - [ ] allow proctors to view and absolve anomalies
- [ ] allow site admins to view any exam without a registration
  - [ ] there's some code in the exams controller that breaks if the user does not have an active registration for the exam
- [ ] find out if the exam network setup necessitates any changes to server
- [ ] make logo for favicon, readme, navbar
- [ ] grab student first and last names from LDAP?
- [ ] add a license
- [ ] pressing Ctrl-R from within exam
