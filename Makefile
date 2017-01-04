publish:
	python generate.py
	ghp-import output -n -c bonjourmontagne.fr -p -m "Update website"
