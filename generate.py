"""
Generate a static site for bonjourmontagne.fr

It reads a Dropbox-stored archives with source data :
- a json file w/ metadata
- a directory with pictures

Then it parses the JSON and creates a HTML page for each mountain and copies
the pictures to the output directory.

Finally, it pushes the output directory to the `gh-pages` branch for publishing.
"""

import os
import json
import zipfile
import shutil

import arrow # pylint: disable=E0401
import click
import requests
from jinja2 import Template

def create_page(mountain, template_path, nb_mountains, index=False):
    """Create a page for a mountain"""
    mid = mountain['id']
    with open(template_path) as template_file:
        template = Template(template_file.read())
        date_obj = arrow.get(mountain['date'], 'YYYY-MM-DD')
        variables = {
            'mountain': mountain,
            'next': False if mid == nb_mountains else mid + 1,
            'previous': False if mid == 1 else mid - 1,
            'date': date_obj.format('D MMMM YYYY', locale='fr'),
            'meta_description': mountain['description'] if not index else None,
            'meta_title': mountain['description'] if not index else None
        }
        return template.render(**variables)

def write_page(output, page, mountain, erase=False, index=False):
    """Write a page to filesystem"""
    click.echo('Processing #%s...' % mountain['id'])
    page_name = 'index.html' if index else '%s.html' % mountain['id']
    page_path = os.path.join(output, page_name)
    if os.path.exists(page_path) and not erase:
        click.echo('Skipped already existing %s' % page_path)
    with open(page_path, 'w') as page_file:
        page_file.write(page.encode('utf8'))

def fetch_source(source, tmp_dir):
    """Fetch the source archive and expand it into tmp_dir"""
    click.echo('Fetching archive...')
    req = requests.get(source, stream=True)
    if req.status_code == 200:
        zip_path = os.path.join(tmp_dir, 'out.zip')
        with open(zip_path, 'wb') as zip_out_file:
            for chunk in req:
                zip_out_file.write(chunk)
        zip_ref = zipfile.ZipFile(zip_path, 'r')
        zip_ref.extractall(os.path.join(tmp_dir, 'out'))
        click.echo('Archive fetched and expanded.')
    else:
        click.echo('Something went wrong while downloading source (%s)' % req.status_code)


def copy_images(tmp_dir, output):
    """Delete output images and copy the new images to the ouput directory"""
    out_path = os.path.join(output, 'pictures')
    shutil.rmtree(out_path)
    shutil.copytree(
        os.path.join(tmp_dir, 'out', 'pictures'),
        out_path
    )

@click.command()
@click.option(
    '--source',
    default='https://www.dropbox.com/sh/1xherkmoavts4qx/AACMUlQkFeYaxvaX89Fhpm70a?dl=1',
    help='Input archive'
)
@click.option('--output', default='./output', help='Output directory path')
@click.option('--template', default='./template.html', help='HTML Jinja2 mountain template path')
@click.option('--delete', is_flag=True, help='Overwrite existing output files')
@click.option('--skip-source', is_flag=True, help='Do not refresh from source')
def generate(source, output, template, delete, skip_source):
    """Script entry point"""
    tmp_dir = './tmp'
    if not skip_source:
        fetch_source(source, tmp_dir)
        copy_images(tmp_dir, output)
    with open(os.path.join(tmp_dir, 'out', 'mountains.json')) as json_file:
        mountains = json.load(json_file)['data']
        # filter post-dated mountains
        mountains = [m for m in mountains if arrow.get(m['date'], 'YYYY-MM-DD') <= arrow.now()]
        nb_mountains = len(mountains)
        for mountain in mountains:
            page = create_page(mountain, template, nb_mountains)
            write_page(output, page, mountain, delete)
        # write the index w/ the last mountain
        page = create_page(mountains[0], template, nb_mountains, index=True)
        write_page(output, page, mountains[0], erase=True, index=True)

if __name__ == '__main__':
    generate() # pylint: disable=E1120
