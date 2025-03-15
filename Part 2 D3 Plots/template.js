// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 40, right: 30, bottom: 40, left: 60},
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add scales     
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
        .nice()
        .range([height, 0]);
    
    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add axis labels
    svg.append('text')
        .text('Platform')
        .attr('x', width/2.5)
        .attr('y', height + 40)

    svg.append('text')
        .text('Likes')
        .attr('x', 0 - height/2)
        .attr('y', -40)
        .attr('transform', 'rotate(-90)')
    
    // Calculate quartiles, min, and max for each platform
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return { min, q1, median, q3, max };
    };

    // Group data by platform and compute statistics
    const quantilesByPlatform = d3.rollup(data, rollupFunction, d => d.Platform);

    quantilesByPlatform.forEach((quantiles, Platform) => {
        // Calculate the x-position for each boxplot, centered in the middle of the corresponding category
        const x = xScale(Platform) + xScale.bandwidth() / 2;
        // Define the width of the box, as a fraction of the bandwith to leave space between boxes
        const boxWidth = xScale.bandwidth() * 0.6;

        // Vertical line from min to max
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black");

        // Box from Q1 to Q3
        svg.append("rect")
            .attr("x", x - boxWidth / 2)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr("stroke", "black")
            .attr("fill", "lightgray");

        // Median line
        svg.append("line")
            .attr("x1", x - boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quantiles.median))
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "black");
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 50, right: 100, bottom: 50, left: 80 },
          width = 700 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the scales
    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.PostType))])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add x and y axes    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Average Likes");

  // Group container for bars
    const barGroups = svg.selectAll(".bar-group")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.Platform)},0)`);

  // Draw bars
    barGroups.append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));
      
    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(type)
            .attr("alignment-baseline", "middle");
  });
});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 
const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 50, right: 100, bottom: 70, left: 80 },
          width = 700 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#lineplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes  
    const x = d3.scalePoint()
        .domain(data.map(d => d.Date))
        .range([0, width])
        .padding(0.5);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .nice()
        .range([height, 0]);
    
    // Draw the axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text") // Rotate x-axis labels if needed
        .style("text-anchor", "end")
        .attr("transform", "rotate(-25)");

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 65)
        .attr("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Average Likes");

    // Define the line generator
    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.AvgLikes))
        .curve(d3.curveNatural);
    
    // Draw the line path
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#1f77b4")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add data points
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.Date))
        .attr("cy", d => y(d.AvgLikes))
        .attr("r", 4)
        .attr("fill", "#1f77b4");
});