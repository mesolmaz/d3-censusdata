# Correlations between Age/Income and Health Risks

![dynamic_scatter_plot](/assets/data/dynamic_plot.gif)

## Background on data
The data set presented here is based on 2014 American Community Survey 1-year estimates from the [US Census Bureau](https://data.census.gov/cedsci/). It includes data on rates of Household Income (median), Obesity (%), Poverty (%), Age (median), Smoking population (%), and Healthcare lacking population (%) by state. 
The data source `data.csv` can be seen for raw data. 

## Scatterplot

The scatterplot below was created with each state represented with circle elements. User is able to dynamically switch between different correlations by clicking on additional labels on X and Y axes. A regression line visually shows the existence of correlations while R² provides numerical confidence.
The user is able to hover over the individial circles and obtain the true data. 

* Note: You'll need to use `python -m http.server` to run the visualization. This will host the page at `localhost:8000` in your web browser. 



