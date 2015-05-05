# Data Retrieval Scripts for GrubBudge
William Xie

## Instructions

Install required node dependencies and packages.

> npm install

Run the *restaurant.js* script which will output data points for restaurants from Yelp and Google Places API in the file *output.json* in the local directory.

> node restaurant.js

Currently, this output is not in a correct json format. 

To fix this: 

1) Remove the last comma found at the end of *output.json*

2) Surround the content of the file with square brackets - that is, prepend a "[" and append a "]"

This should correctly fix and format the output. If not, there is a correct version located in this project directory.

Now, run *category.js*.

> node category.js

A list of the most popular categories sorted descending should appear in *category.json*

Finally, run price.js to web scrape price data from Yelp pages.

> node price.js

This will read from *output.json* and create a file *output_full.json* with available price data from Yelp attached to each restaurant data point.

*output_full.json* is the finalized data used for GrubBudge's database. 

This will also need to be fixed in the same way as *output.json*
