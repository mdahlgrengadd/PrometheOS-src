from setuptools import setup, find_packages

setup(
    name="prometheos",
    version="1.0.0",
    description="PrometheOS Python Client - Desktop API bridge for Pyodide",
    author="PrometheOS Team",
    packages=find_packages(),
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3",
    ],
)