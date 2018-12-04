const request = require('request');
const cheerio = require('cheerio');
//need express

let qi=qp='';
process.argv.forEach((val, index, array) =>
{
	if(index==2)
			qi = val;
	if(index==3)
		if(val!=0)
			qp = val;
});
let inj = qi+" below "+qp+'';

function zip() {
    var args = [].slice.call(arguments);
    var shortest = args.length==0 ? [] : args.reduce(function(a,b){
        return a.length<b.length ? a : b
    });

    return shortest.map(function(_,i){
        return args.map(function(array){return array[i]})
    });
}

async function scrape_snapdeal(handle_snapdeal)
{
	let urls = 'https://www.snapdeal.com/search?sort=rlvncy&keyword=';
	request(urls+inj,(error,response,html)=>
	{
		if(!error && response.statusCode === 200)
		{
			handle_snapdeal(cheerio.load(html));
		}
	});
}

var RESULTS = [];
function end(arr)
{
	//arr.forEach(i => console.log(i));
	RESULTS.push(arr);	
	return {"data" : RESULTS};
}

async function handle_snapdeal(that,cb)
{
	let arr = [];
	const $ = that;
			
	var img = $("#products").map(function()
	{
		return $(this).find("picture > source").map(function()
		{
			return $(this).attr("srcset");
		}).get();        
	}).get();
	
	var tit = $("#products").map(function()
	{
		return $(this).find("div > a > picture > img").map(function()
		{
			return $(this).attr("title");
		}).get();        
	}).get();
	
	var links = $("#products").map(function()
	{
		return $(this).find("div > a").map(function()
		{
			return $(this).attr("href");
		}).get();        
	}).get();
		
	var price = $("#products").map(function()
	{
		return $(this).find("span:nth-of-type(2)").map(function()
		{
			return $(this).attr("data-price");
		}).get();        
	}).get();
		
	var link = new Set(links);
	
	var getEntriesArry = link.entries();
	
	let dmp = [],l;
	l = String(getEntriesArry.next().value);		
		l = l.substring(0,l.indexOf(","));
	dmp.push(l);
		l = String(getEntriesArry.next().value);		
		l = l.substring(0,l.indexOf(","));
	dmp.push(l);
		l = String(getEntriesArry.next().value);		
		l = l.substring(0,l.indexOf(","));
	dmp.push(l);
		l = String(getEntriesArry.next().value);		
		l = l.substring(0,l.indexOf(","));
	dmp.push(l);
	l = String(getEntriesArry.next().value);		
		l = l.substring(0,l.indexOf(","));
	dmp.push(l);
		l = String(getEntriesArry.next().value);		
		l = l.substring(0,l.indexOf(","));
	dmp.push(l);
		l = String(getEntriesArry.next().value);		
		l = l.substring(0,l.indexOf(","));
	dmp.push(l);
		l = String(getEntriesArry.next().value);		
		l = l.substring(0,l.indexOf(","));
	dmp.push(l);
	for(var i=0; i<8; i++)
	{
		if((price[i]<=qp*1.15 && price[i]>=0))
			await arr.push({
							"image" : img[i],
							"link"  : dmp[i],
							"price" : price[i],
							"title" : tit[i]
							});
	}	
	console.log(end(arr));
}

async function scrape_flipkart(cb)
{
	let urlf = 'https://www.flipkart.com/search?sort=relevance&q=';
	request(urlf+inj,(error,response,html)=>
	{
		if(!error && response.statusCode === 200)
		{
			cb(cheerio.load(html));
		}
	});
}

async function handle_flipkart(that,cb)
{
	let arr = [];
	const $ = that;

	//GET
	var url = $("#container > div > div > div > div > div > div > div > div > div > div > a").map(function()
	{
		return $(this).map(function()
		{
			let lnk = $(this).attr("href");	//Link
			if(lnk !== undefined || lnk != "")
			return "https://www.flipkart.com"+lnk.trim();
		}).get();        
	}).get();
	//OP
	url = new Set(url);
	let links = [];
	url.forEach(v => links.push(v));
	let noOfLinks = links.length;
	if(noOfLinks > 7)
	links = links.slice(0,8);
	else
	links = links.slice(0,noOfLinks);
	
	//GET
	let prices = $("#container > div > div > div > div > div > div > div > div > div > div > a > div > div").map(function()
	{
		return $(this).map(function()
		{
			let p = $(this).first().text();	//Price
			if(p.length)
			{
				return p.substring(1,p.length).trim().replace(",","");
			}
		}).get();        
	}).get();
	//OP
	let noOfPrices = prices.length;
	let p = [];
	if(noOfPrices > 7)
	{
		let adj = [];
		for(let i = 0; i < 8*3;i++)
		{	
			adj[i+1] = prices[i];
		}
		adj[0] = "#";

		
		for(let i = 1 ; i < 8*3;)
		{
			p.push(adj[i]);
			i += 3;
		}
	}
	else
	{
		let adj = [];
		for(let i = 0; i < noOfPrices*3;i++)
		{	
			adj[i+1] = price[i];
		}
		adj[0] = "#";

		for(let i = 1 ; i < noOfPrices*3;)
		{
			p.push(adj[i]);
			i += 3;
		}
	}
	prices = p;

	//GET
	let title = $("#container > div > div > div > div > div > div > div > div > div > div > a > div > div > div > img").map(function()
	{
		return $(this).map(function()
		{
			let tit = $(this).attr("alt");	//Title
			if(tit !== undefined)
			return tit;
		}).get();
	}).get();
	//OP
	let noOfTitles = title.length;
	let titles = [];
	if( noOfTitles > 7)
		titles = title.slice(0, 8);
	else
		titles = title.slice(0, noOfTitles);
	
	numOfResults = Math.min(noOfLinks,noOfPrices,noOfTitles);
	let l = links.slice(0,numOfResults);
	p = prices.slice(0,numOfResults);
	let t = titles.slice(0,numOfResults);
	
	let i = [];
	for(let j = 0 ; j < numOfResults; j++)
	{
		i.push("https://img1a.flixcart.com/www/promos/new/20150528-140547-favicon-retina.ico");
	}	
	zipped = zip(i,l,p,t);
	end(zipped);
}

function call_all()
{
	scrape_snapdeal(handle_snapdeal);
	// scrape_flipkart(handle_flipkart);
	// let z =  amazon();
}
call_all();