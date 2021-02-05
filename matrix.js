'use strict'
// Size of single cell of the scatterplot matrix
const size = 80
// Space around the entire matrix (for labels)
const margin = 80
// Space between cells
const padding = 20
//Parameters for creating arrows
const arrowParameters = {
  xArrowPoints: '20,0 50,0 50,-5 60,2.5 50,10 50,5 20,5',
  yArrowPoints: '0,20 0,50 -5,50 2.5,60 10,50 5,50 5,20',
  fill: '#aaa',
  stroke: '#000',
  mouseover: '#000'
}
//The limit of variable numbers that will plot dots, or else a line that signifies the correlation will enter.
const maxVarNumber = 6

const step = 200
let keepSymmetrical = true
let clickable = true

const x = d3.scaleLinear().range([0, size])
const y = d3.scaleLinear().range([0, size])
const color = d3.scaleLinear().domain([-1,0,1]).range(["blue", "white", "red"])

const xAxis = d3.axisTop().scale(x).ticks(3)
const yAxis = d3.axisLeft().scale(y).ticks(3)

d3.csv('flowers.csv').then(function(data) {
  const domains = {}
  const dimensions = d3.keys(data[0])
  const n = dimensions.length
  const arrows = Array.from(Array(n-1).keys())

  dimensions.forEach(function(dimension) {
    domains[dimension] = d3.extent(data, d => d[dimension])
  })

  const svg = d3.select('#splom')
      .append('svg')
      .attr('width', 2 * margin + (size + padding) * n)
      .attr('height', 1 * margin + (size + padding) * n)

  const matrix = svg.append('g')
      .attr('transform', `translate(${margin},${margin})`)

  const arrowsX = svg.selectAll('.arrowsX').data(arrows).enter().append('g')
      .attr('transform', d => `translate(${margin + d * (size + padding)},${margin * 0.15})`)
      .each(function(){
        d3.select(this).append('polygon').attr('class',d => 'arrowsX'+d)
            .attr('points', arrowParameters.xArrowPoints )
            .style('fill',arrowParameters.fill).style('stroke',arrowParameters.stroke)
            .on('mouseover', function(){
              d3.select(this).style('fill',arrowParameters.mouseover)
            })
            .on('mouseout', function(){
              d3.select(this).style('fill', arrowParameters.fill)
            })
            .on('click', function(d){
              if(clickable) {
                clickable = false
                if (keepSymmetrical) {
                  //reorderSymmetricallyColFirst(d)
                                  d3.selectAll('.arrowsY'+d)
                                      .transition().duration(step).style('fill',arrowParameters.mouseover)
                                      .transition().duration(step).style('fill',arrowParameters.fill)
                                  reorderSymmetrically(d)
                  setTimeout(function(){
                    clickable = true
                  },3*step)

                } else {
                  reorderHorizontally(d)
                  setTimeout(function(){
                    clickable = true
                  },2*step)
                }
              }
            })
      })
  const arrowsY = svg.selectAll('.arrowsY').data(arrows).enter().append('g')
      .attr('transform', d => `translate(${margin * 0.15},${margin + d * (size + padding)})`)
      .each(function(){
        d3.select(this).append('polygon').attr('class',d => 'arrowsY'+d)
            .attr('points', arrowParameters.yArrowPoints )
            .style('fill',arrowParameters.fill).style('stroke',arrowParameters.stroke)
            .on('mouseover', function(){
              d3.select(this).style('fill',arrowParameters.mouseover)
            })
            .on('mouseout', function(){
              d3.select(this).style('fill', arrowParameters.fill)
            })
            .on('click', function(d) {
              if (clickable) {
                clickable = false
                if (keepSymmetrical) {
                  //reorderSymmetricallyRowFirst(d)
                                  d3.selectAll('.arrowsX'+d)
                                      .transition().duration(step).style('fill',arrowParameters.mouseover)
                                      .transition().duration(step).style('fill',arrowParameters.fill)
                                  reorderSymmetrically(d)
                  setTimeout(function(){
                    clickable = true
                  },3*step)
                } else {
                  reorderVertically(d)
                  setTimeout(function(){
                    clickable = true
                  },2*step)
                }
              }
            })
      })

  const legendMargin = 30
  const legendPadding = 4
  const legendData = Array.from(Array(20).keys())
  const legendScale = d3.scaleLinear().range([-1,1]).domain([0,20])
  const svgLegend = d3.select('#legend')
      .append('svg')
      .attr('width', 2 * legendMargin + ((size/2)+legendPadding) * (legendData.length))
      .attr('height', 1 * legendMargin + (size/2))

  const legend = svgLegend.selectAll('legend')
        .data(legendData)
        .enter()
        .append('g')
        .attr('transform', d => `translate(${legendMargin + d * ((size/2)+legendPadding)},${legendMargin})`)
        .each(function(d){
          d3.select(this).append('rect')
              .attr('class', d => "legend"+d)
              .attr('height', (size/2))
              .attr('width', size/2)
              .attr('fill',color(legendScale((d+(d+1))/2)) )
              .attr('stroke', '#aaa').style('stroke-width', '4')
        })

  const legendLabelData = Array.from(Array(20).keys())
  legendLabelData.push(20)
  const legendLabel = svgLegend.selectAll('legendLabel')
      .data(legendLabelData)
      .enter()
      .append('g')
      .attr('class', d => 'legendLabel'+d)
      .attr('transform', d => `translate(${legendMargin + d * ((size/2)+legendPadding)},${0.8*legendMargin})`)
      .each(function(d){
        d3.select(this).append('text')
            .attr('class', 'legendLabel')
            .attr('text-anchor', 'middle')
            .text(legendScale(d).toFixed(1))
            .style("font-size","16px")
      })

  const setAxes = function() {
    svg.selectAll('.x.axis')
        .data(dimensions)
        .enter()
        .append('g')
        .attr('class', (d,i) => "xaxis"+i+" " +"delete")
        .attr('transform', (d, i) => `translate(${margin + i * (size + padding)},${margin * 0.8})`)
        .each(function (d) {
          x.domain(domains[d]);
          d3.select(this).call(xAxis)
        })
    svg.selectAll('.y.axis')
        .data(dimensions)
        .enter()
        .append('g')
        .attr('class', (d,i) => "yaxis"+i+" " +"delete")
        .attr('transform', (d, i) => `translate(${margin * 0.8},${margin + i * (size + padding)})`)
        .each(function (d) {
          y.domain(domains[d]);
          d3.select(this).call(yAxis)
        })
  }

  const setLabel = function() {
    svg.selectAll('.x.label')
        .data(dimensions)
        .enter()
        .append('g')
        .attr('class', (d, i) => "xlabel" + i+" " +"delete")
        .attr('transform', (d, i) => `translate(${margin + i * (size + padding)},${margin * 0.5})`)
        .each(function (d) {
          d3.select(this).append('text')
              .attr('x', size / 2)
              .style('text-anchor', 'middle')
              .text(d)
        })

    svg.selectAll('.y.label')
        .data(dimensions)
        .enter()
        .append('g')
        .attr('class', (d, i) => "ylabel" + i+" " +"delete")
        .attr('transform', (d, i) => `translate(${margin * 0.5},${margin + i * (size + padding)})`)
        .each(function (d) {
          d3.select(this)
              .append('text')
              .attr('text-anchor', 'middle')
              .attr('transform', `translate(0,${size / 2})rotate(-90)`)
              .text(d)
        })
  }

  const cell = function(){
    matrix.selectAll('.cell')
        .data(cross(dimensions, dimensions))
        .enter().append('g')
        .attr('class', 'cell')
        .attr('class', d => "col"+d.i +" " +"row"+d.j+" " +"delete")
        .attr('transform', d => `translate(${d.i * (size + padding)},${d.j * (size + padding)})`)
        .each(plot)
  }

  const correlationSection = function(x){
    for(let i=0; i<20; i++) {
        if(x>=(-1+(+i*0.1)) && x<=(-1+(+i+1)*0.1)){
          return i
        }
    }
  }

  const plot = function (p) {
    const cell = d3.select(this)
    x.domain(domains[p.x])

    const allXdata = data.map(d => d[p.x]);
    const allYdata = data.map(d => d[p.y]);
    const corXY = spearson.correlation.spearman(allXdata, allYdata).toFixed(4)

    const tipCor = d3.tip()
        .attr('class', 'tip')
        .offset([-3, 0])
        .html(function () {
          return "<strong>Correlation:</strong> <span style='color:#fff'>" + corXY + "</span>";
        })

    svg.call(tipCor);
    cell.append('rect')
        .attr('class', 'frame')
        .attr('width', size)
        .attr('height', size)
        .style('fill', color(corXY))
        .on('mouseover', function(){
          tipCor.show()
          d3.selectAll('.legend'+correlationSection(corXY)).attr('stroke','#000')
        })
        .on('mouseout', function(){
          tipCor.hide()
          d3.selectAll('.legend'+correlationSection(corXY)).attr('stroke','#aaa')
        })

  if(dimensions.length <= maxVarNumber) {
    if (p.x === p.y) {
      const histogram = d3.histogram()
          .value(d => d[p.x])
          .domain(x.domain())
      const bins = histogram(data)
      y.domain([0, d3.max(bins, d => d.length)])

      cell.append('g')
          .selectAll('rect')
          .data(bins)
          .enter()
          .append('rect')
          .attr('x', d => x(d.x0))
          .attr('y', d => size - y(d.length))
          .attr('width', d => x(d.x1) - x(d.x0))
          .attr('height', d => y(d.length))

     } else {
        y.domain(domains[p.y])
        cell.append('g')
          .selectAll('circle')
          .data(data)
          .enter()
          .append('circle')
          .attr('cx', d => x(d[p.x]))
          .attr('cy', d => y(d[p.y]))
          .attr('r', 2)
          .style('fill', 'black')
      }


    } else{

    cell.append('line')
        .attr('class', 'slope')
        .attr("x1", 0)
        .attr("y1", ((1+(+corXY))/2)*size)
        .attr("x2", size)
        .attr("y2", ((1-corXY)/2)*size)
        .style("stroke-linecap", "round")

    }
  }

  const reset = function(){
    if(dimensions.length <= maxVarNumber){
      setAxes()
    }
    setLabel()
    cell()
  }

  const cross = function (a, b) {
    const c = []
    const n = a.length
    const m = b.length
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < m; ++j) {
        c.push({x: a[i], i: i, y: b[j], j: j})
      }
    }
    return c
  }

  /* In this task the method from external library spearson.js is used for calculating correlation.
  const getCorrelation = function(x,y){
    if(x!=null && y!= null && x.length === y.length){
      const xy = []
      for(let i = 0; i < x.length; i++){
        xy.push(x[i]*y[i]);
      }
      return ((d3.mean(xy) - d3.mean(x)*d3.mean(y)) /(d3.deviation(x)*d3.deviation(y))).toFixed(4);
    }
    else{
      console.log("The correlation is not computable.")
    }
  }
  */

  const reorderXGrid = function(i){
    d3.selectAll('.xaxis'+i).transition().duration(step)
        .attr('transform', `translate(${margin+(i+1)*(size + padding)}, ${margin * 0.8})`)
        .attr('class', "xaxis"+(i+1)+" " +"delete")
    d3.selectAll('.xaxis'+(i+1)).transition().duration(step)
        .attr('transform', `translate(${margin+i*(size + padding)}, ${margin * 0.8})`)
        .attr('class', "xaxis"+i+" " +"delete")
    d3.selectAll('.xlabel'+i).transition().duration(step)
        .attr('transform', `translate(${margin+(i+1)*(size + padding)}, ${margin * 0.5})`)
        .attr('class', "xlabel"+(i+1)+" " +"delete")
    d3.selectAll('.xlabel'+(i+1)).transition().duration(step)
        .attr('transform', `translate(${margin+i*(size + padding)}, ${margin * 0.5})`)
        .attr('class', "xlabel"+i+" " +"delete")
  }

  const reorderYGrid = function(j){
    d3.selectAll('.yaxis'+j).transition().duration(step)
        .attr('transform', `translate( ${margin * 0.8}, ${margin+(j+1)*(size + padding)})`)
        .attr('class', "yaxis"+(j+1)+" " +"delete")
    d3.selectAll('.yaxis'+(j+1)).transition().duration(step)
        .attr('transform', `translate( ${margin * 0.8}, ${margin+j*(size + padding)})`)
        .attr('class', "yaxis"+j+" " +"delete")
    d3.selectAll('.ylabel'+j).transition().duration(step)
        .attr('transform', `translate(${margin * 0.5}, ${margin+(j+1)*(size + padding)})`)
        .attr('class', "ylabel"+(j+1)+" " +"delete")
    d3.selectAll('.ylabel'+(j+1)).transition().duration(step)
        .attr('transform', `translate(${margin * 0.5}, ${margin+j*(size + padding)})`)
        .attr('class', "ylabel"+j+" " +"delete")
  }


  //change the positions of i-th and (i+1)-th column
  const columnToNext = function(i){
    for(let j = 0; j < dimensions.length; j++){
      d3.selectAll(".col"+i+".row"+j)
          .transition()
          .duration(step)
          .attr('transform', `translate(${(i+1) * (size + padding)}, ${j*(size + padding)})`)
          .attr('class', "col"+(i+1)+" " +"row"+j+" " +"delete")
      d3.selectAll(".col"+(i+1)+".row"+j)
          .transition()
          .duration(step)
          .attr('transform', `translate(${i * (size + padding)}, ${j*(size + padding)})`)
          .attr('class', "col"+i+" " +"row"+j+" " +"delete")
    }
  }


  const reorderHorizontally = function(i){
    reorderXGrid(i)
    columnToNext(i)
  }

  //change the positions of i-th and (i+1)-th row
  const rowToNext = function(j){
    for(let i = 0; i < dimensions.length; i++){
      d3.selectAll(".col"+i+".row"+j)
          .transition()
          .duration(step)
          .attr('transform', `translate(${i * (size + padding)}, ${(j+1)*(size + padding)})`)
          .attr('class', "col"+i+" " +"row"+(j+1)+" " +"delete")

      d3.selectAll(".col"+i+".row"+(j+1))
          .transition()
          .duration(step)
          .attr('transform', `translate(${i * (size + padding)}, ${j*(size + padding)})`)
          .attr('class', "col"+i+" " +"row"+j+" " +"delete")}

  }

  const reorderVertically = function(j){
    reorderYGrid(j)
    rowToNext(j)
  }

  const reorderSymmetricallyColFirst = function(i) {
    reorderHorizontally(i)
    setTimeout(function(){
      d3.selectAll('.arrowsY'+i)
          .transition().duration(step/2).style('fill',arrowParameters.mouseover)
          .transition().duration(step/2).style('fill',arrowParameters.fill)
      reorderVertically(i)
    },2*step)
  }

  const reorderSymmetricallyRowFirst = function(i) {
    reorderVertically(i)
    setTimeout(function(){
      reorderHorizontally(i)
      d3.selectAll('.arrowsX'+i)
          .transition().duration(step/2).style('fill',arrowParameters.mouseover)
          .transition().duration(step/2).style('fill',arrowParameters.fill)
    },2*step)
  }

  const reorderSymmetrically =  function(i){
    reorderXGrid(i)
    reorderYGrid(i)
      for(let j = 0; j < dimensions.length; j++) {
        if (j === i || j === (i+1)) {
          d3.selectAll(".col" + i + ".row" + i).transition().duration(step)
              .attr('transform', `translate(${(i+1) * (size + padding)}, ${(i+1) * (size + padding)})`)
              .attr('class', "col" + (i+1) + " " + "row" + (i+1)+" " +"delete")
          d3.selectAll(".col" + (i+1) + ".row" + (i+1)).transition().duration(step)
            .attr('transform', `translate(${i * (size + padding)}, ${i * (size + padding)})`)
            .attr('class', "col" + i + " " + "row" + i+" " +"delete")
          d3.selectAll(".col" + (i+1) + ".row" + i).transition().duration(step)
              .attr('transform', `translate(${i * (size + padding)}, ${(i+1) * (size + padding)})`)
              .attr('class', "col" + i + " " + "row" + (i+1)+" " +"delete")
          d3.selectAll(".col" + i + ".row" + (i+1)).transition().duration(step)
              .attr('transform', `translate(${(i+1) * (size + padding)}, ${i * (size + padding)})`)
              .attr('class', "col" + (i+1) + " " + "row" + i+" " +"delete")
        }
        else {
          d3.selectAll(".col" + i + ".row" + j).transition().duration(step)
              .attr('transform', `translate(${(i+1) * (size + padding)}, ${j * (size + padding)})`)
              .attr('class', "col" + (i+1) + " " + "row" + j+" " +"delete")
          d3.selectAll(".col" + (i + 1) + ".row" + j).transition().duration(step)
              .attr('transform', `translate(${i * (size + padding)}, ${j * (size + padding)})`)
              .attr('class', "col" + i + " " + "row" + j+" " +"delete")
          d3.selectAll(".col" + j + ".row" + i).transition().duration(step)
              .attr('transform', `translate(${j * (size + padding)}, ${(i+1) * (size + padding)})`)
              .attr('class', "col" + j + " " + "row" + (i+1)+" " +"delete")
          d3.selectAll(".col" + j + ".row" + (i+1)).transition().duration(step)
              .attr('transform', `translate(${j * (size + padding)}, ${i * (size + padding)})`)
              .attr('class', "col" + j + " " + "row" + i+" " +"delete")
        }
      }
  }


  const main = function(){
    reset()
    const btn1  = document.getElementById('btn1')
    btn1.onclick = function(){
      if(keepSymmetrical){
        btn1.innerText = 'Free Reordering'
        d3.selectAll('.delete').remove()
      }else{
        btn1.innerText = 'Symmetrical Reordering'
        d3.selectAll('.delete').remove()
      }
      setTimeout(function(){
        reset()
      },200)
      keepSymmetrical = !keepSymmetrical
    }

  }

  main();
})
