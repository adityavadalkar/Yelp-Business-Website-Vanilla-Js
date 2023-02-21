from flask import Flask, send_from_directory, request, jsonify
import requests
import json

app = Flask(__name__, static_url_path='/static')
yelp_API = 'YOUR_API_KEY'
headers = {
        'Authorization': 'Bearer %s' % yelp_API,
    }

@app.route("/")
def hello():
  return send_from_directory('static', 'index.html')

@app.route('/results')
def get_data():
  keyword = request.args.get('keyword')
  distance = int((float(request.args.get('distance')))*1609)
  category = request.args.get('category')
  location = request.args.get('location')
  location = location.split(",")
  url = "https://api.yelp.com/v3/businesses/search?term=" + str(keyword) +"&latitude=" + location[0] + "&longitude=" + location[1] + "&radius=" + str(distance) + "&categories=" + category
  response = requests.request('GET', url, headers=headers)
  return response.json()

@app.route('/details')
def get_details():
  id = request.args.get('id')
  url = "https://api.yelp.com/v3/businesses/" + str(id)
  response = requests.request('GET', url, headers= headers)
  return response.json()

if __name__ == "__main__":
  app.run(debug=True, port=5000)