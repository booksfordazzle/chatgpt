# Required stem scan

Command: Python regex scan (case insensitive) of every tracked/source and built `.html`, `.js`, `.json`, excluding tooling cache and `.git`. Historical before-copy is intentionally preserved in Markdown/TSV evidence.

- `dist/blog/tallow-science.html:3`: `</p><h3>Βιταμίνη E</h3><p>Η βιταμίνη Ε είναι συστατικό της υπό ανάπτυξη σύνθεσης. Δεν τεκμηριώνεται αντιοξειδωτική δράση του τελικού προϊόντος στην επιδερμίδα.<!-- TODO(owner): επιβεβαίωσε ρόλο και ποσοστά από το εργαστήριο. --></p><p>Στην κοσμετολογία `
- `dist/index.html:3`: `svg><h3>Βιταμίνη Ε</h3><p>Η βιταμίνη Ε είναι συστατικό της υπό ανάπτυξη σύνθεσης. Δεν τεκμηριώνεται αντιοξειδωτική δράση του τελικού προϊόντος στην επιδερμίδα.<!-- TODO(owner): επιβεβαίωσε ρόλο και ποσοστά από το εργαστήριο. --></p><!-- TODO(owner): επι`
- `public/blog/tallow-science.html:3`: `</p><h3>Βιταμίνη E</h3><p>Η βιταμίνη Ε είναι συστατικό της υπό ανάπτυξη σύνθεσης. Δεν τεκμηριώνεται αντιοξειδωτική δράση του τελικού προϊόντος στην επιδερμίδα.<!-- TODO(owner): επιβεβαίωσε ρόλο και ποσοστά από το εργαστήριο. --></p><p>Στην κοσμετολογία `
- `public/index.html:3`: `svg><h3>Βιταμίνη Ε</h3><p>Η βιταμίνη Ε είναι συστατικό της υπό ανάπτυξη σύνθεσης. Δεν τεκμηριώνεται αντιοξειδωτική δράση του τελικού προϊόντος στην επιδερμίδα.<!-- TODO(owner): επιβεβαίωσε ρόλο και ποσοστά από το εργαστήριο. --></p><!-- TODO(owner): επι`

All four matches (two source statements plus their built copies) explicitly deny substantiated antioxidant action of the final product. They are limitations, not positive efficacy claims. Generated Lighthouse HTML/JSON were also scanned.
